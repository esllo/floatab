import {
  getAll,
  WebviewWindow,
  type WindowOptions,
} from "@tauri-apps/api/window";
import { getClient, ResponseType } from "@tauri-apps/api/http";
import { invoke } from "@tauri-apps/api/tauri";

export interface UniqueWindow {
  label: string;
  webviewWindow: WebviewWindow;
  ignoreClick: boolean;
  alwaysTop: boolean;
}

export interface WindowState {
  label: string;
  decorated: boolean;
  resizable: boolean;
  ignoreClick: boolean;
  visible: boolean;
  alwaysTop: boolean;
}

interface ManagedStore {
  labels: string[];
  windows: {
    [label: string]: UniqueWindow;
  };
  callback: ((states: WindowState[]) => void)[];
}

const managedStore: ManagedStore = {
  get labels() {
    return Object.keys(this.windows);
  },
  windows: {},
  callback: [],
};

export function checkWindows() {
  const windows = getAll();
  const labels = windows
    .map(({ label }) => label)
    .filter((label) => label !== "main");

  const cleanups = managedStore.labels.filter(
    (label) => !labels.includes(label)
  );

  cleanups.forEach((label) => delete managedStore.windows[label]);

  const isloateds = labels.filter(
    (label) => !managedStore.labels.includes(label)
  );

  isloateds.forEach((label) => {
    const window = windows.find((window) => label === window.label);
    if (window) {
      managedStore.labels.push(label);
      managedStore.windows[label] = {
        ignoreClick: false,
        alwaysTop: false,
        label,
        webviewWindow: window,
      };
    }
  });

  cleanupWindows(managedStore.labels);

  postAllWindowStates();
}

async function postAllWindowStates() {
  const states = await getAllWindowStates();
  managedStore.callback.forEach((callback) => callback(states));
}

export function addTauriCallback(callback: (states: WindowState[]) => void) {
  if (managedStore.callback.includes(callback)) {
    return false;
  }

  managedStore.callback.push(callback);
  return true;
}

export function removeTauriCallback(callback: (states: WindowState[]) => void) {
  const index = managedStore.callback.indexOf(callback);
  if (index !== -1) {
    managedStore.callback.splice(index, 1);
    return true;
  }
  return false;
}

export function getAllWindows() {
  return Object.values(managedStore.windows);
}

export async function getAllWindowStates() {
  const windows = Object.values(managedStore.windows);

  const states: WindowState[] = await Promise.all(
    windows.map(async (window) => {
      const { webviewWindow, ignoreClick, label, alwaysTop } = window;
      return {
        label,
        decorated: await webviewWindow.isDecorated(),
        resizable: await webviewWindow.isResizable(),
        ignoreClick,
        alwaysTop,
        visible: await webviewWindow.isVisible(),
      };
    })
  );

  return states;
}

export function setWindowDecoration(label: string, value: boolean) {
  const window = managedStore.windows[label];
  if (window) {
    window.webviewWindow.setDecorations(value).then(postAllWindowStates);
    return true;
  }

  return false;
}

export function setWindowIgnoreClick(label: string, value: boolean) {
  const window = managedStore.windows[label];
  if (window) {
    window.webviewWindow.setIgnoreCursorEvents(value).then(postAllWindowStates);
    window.ignoreClick = value;
    return true;
  }

  return false;
}

export function setWindowAlwaysTop(label: string, value: boolean) {
  const window = managedStore.windows[label];
  if (window) {
    window.webviewWindow.setAlwaysOnTop(value).then(postAllWindowStates);
    window.alwaysTop = value;
    return true;
  }

  return false;
}

export function setWindowResizable(label: string, value: boolean) {
  const window = managedStore.windows[label];
  if (window) {
    window.webviewWindow.setResizable(value).then(postAllWindowStates);
    return true;
  }

  return false;
}

export function setWindowVisible(label: string, value: boolean) {
  const window = managedStore.windows[label];
  if (window) {
    if (value) {
      window.webviewWindow.show().then(postAllWindowStates);
    } else {
      window.webviewWindow.hide().then(postAllWindowStates);
    }
    return true;
  }

  return false;
}

export function closeWindow(label: string) {
  if (managedStore.labels.includes(label)) {
    try {
      const window = managedStore.windows[label];
      if (window.webviewWindow) {
        window.webviewWindow.close();
      }
    } catch (e) {
      // TODO: window already closed
    }
    delete managedStore.windows[label];
  }

  postAllWindowStates();
}

export function createWindow(
  label: string,
  url: string,
  windowOptions: WindowOptions = {},
  onCreatedCallback?: () => void
): UniqueWindow {
  const trimmedLabel = label.trim();

  if (trimmedLabel === "") {
    throw new InvalidLabelError();
  }

  if (managedStore.labels.includes(trimmedLabel)) {
    throw new DuplicatedLabelError();
  }

  const defaultOptions: WindowOptions = {
    decorations: false,
    url,
    transparent: true,
    userAgent:
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/109.0.0.0 Safari/537.36",
    ...windowOptions,
  };

  const webviewWindow = new WebviewWindow(label, defaultOptions);

  if (onCreatedCallback) {
    webviewWindow.once("tauri://created", onCreatedCallback);
  }

  console.log(webviewWindow);
  webviewWindow.listen("tauri://destroyed", () => closeWindow(label));
  webviewWindow.listen("tauri://blur", postAllWindowStates);
  webviewWindow.listen("tauri://focus", postAllWindowStates);
  webviewWindow.once("tauri://created", postAllWindowStates);

  const uniqueWindow: UniqueWindow = {
    label,
    webviewWindow,
    alwaysTop: false,
    ignoreClick: false,
  };

  managedStore.windows[label] = uniqueWindow;

  return uniqueWindow;
}

export function closeAllWindows() {
  Object.entries(managedStore.windows).forEach(([label, uniqueWindow]) => {
    try {
      uniqueWindow.webviewWindow.close();
      delete managedStore.windows[label];
    } catch (e) {
      // TODO: window already closed
    }
  });

  managedStore.windows = {};
}

export async function requestUrl(url: string) {
  const client = await getClient();
  const response = await client.get(url, {
    headers: {
      "User-Agent":
        "Mozilla/5.0 (Windows NT 10.0) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/110.0.0.0 Safari/537.36",
    },
    responseType: ResponseType.Text,
  });

  client.drop();

  return response.status !== 404;
}

export function insertScript(label: string, script: string) {
  invoke("insert_script", {
    label,
    script,
  });
}

export function listWindows() {
  invoke("list_windows");
}

export function cleanupWindows(labels: string[]) {
  invoke("cleanup_windows", {
    labels,
  });
}

export class InvalidLabelError extends Error {
  constructor() {
    super("InvalidLabelError");

    Object.setPrototypeOf(this, InvalidLabelError.prototype);
  }
}

export class DuplicatedLabelError extends Error {
  constructor() {
    super("DuplicatedLabelError");

    Object.setPrototypeOf(this, DuplicatedLabelError.prototype);
  }
}
