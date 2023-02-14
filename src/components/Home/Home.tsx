import {
  addTauriCallback,
  checkWindows,
  closeWindow,
  createWindow,
  getAllWindowStates,
  removeTauriCallback,
  requestUrl,
  setWindowAlwaysTop,
  setWindowDecoration,
  setWindowIgnoreClick,
  setWindowResizable,
  setWindowVisible,
  WindowState,
} from "@/tauri";
import {
  ActionIcon,
  Box,
  Button,
  createStyles,
  Flex,
  Modal,
  Paper,
  Text,
  TextInput,
  useMantineTheme,
} from "@mantine/core";
import {
  IconAspectRatio,
  IconAspectRatioOff,
  IconDeviceLaptop,
  IconDeviceLaptopOff,
  IconMaximize,
  IconMaximizeOff,
  IconMouse,
  IconMouseOff,
  IconPictureInPicture,
  IconPlus,
  IconReload,
  IconX,
} from "@tabler/icons-react";
import { useRef, useState, useEffect } from "react";
import { uuid } from "short-uuid";

const useStyles = createStyles((theme) => ({
  main: {
    height: "100%",
  },
  left: {
    width: 50,
    height: "100%",
    borderRight: `1px solid ${
      theme.colorScheme === "dark" ? theme.colors.dark[7] : theme.colors.gray[3]
    }`,
    display: "flex",
    flexDirection: "column",
    gap: 8,
    padding: 8,
    boxSizing: "border-box",
    alignItems: "center",
  },

  itemList: {
    flex: 1,
  },

  item: {
    flex: 1,
    flexDirection: "column",
    display: "flex",
    borderBottom: `1px solid ${
      theme.colorScheme === "dark" ? theme.colors.dark[7] : theme.colors.gray[3]
    }`,
  },

  itemTop: {
    width: "100%",
    padding: 8,
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
    borderBottom: `1px solid ${
      theme.colorScheme === "dark" ? theme.colors.dark[8] : theme.colors.gray[2]
    }`,
  },
  itemBottom: {
    display: "flex",
    padding: "6px 8px",
    gap: 4,
  },
}));

const Home = () => {
  const { classes } = useStyles();
  const inputRef = useRef<HTMLInputElement>(null);
  const [opened, setOpened] = useState<boolean>(false);
  const [isLoading, setLoading] = useState<boolean>(false);
  const [windowStates, setWindowStates] = useState<WindowState[]>([]);
  const { colors } = useMantineTheme();

  function handleTauriStates(states: WindowState[]) {
    setWindowStates(states);
  }

  useEffect(() => {
    addTauriCallback(handleTauriStates);
    return () => {
      removeTauriCallback(handleTauriStates);
    };
  }, []);

  const handleUrlOpen = () => {
    if (inputRef.current) {
      const url = inputRef.current.value.trim();
      setLoading(true);

      requestUrl(url)
        .then((ok) => {
          if (ok) {
            // url available
            const window = createWindow(uuid(), url, {}, async () => {
              const states = await getAllWindowStates();
              setWindowStates(states);
            });

            setOpened(false);
          } else {
            // url not available
            console.log("not done");
          }
        })
        .catch((e) => {
          console.error(e);
        })
        .finally(() => {
          setLoading(false);
        });
    }
  };

  return (
    <>
      <Flex className={classes.main}>
        <Paper className={classes.left}>
          <ActionIcon color={"indigo.5"} onClick={() => setOpened(true)}>
            <IconPlus />
          </ActionIcon>
          <ActionIcon color={"indigo.4"} onClick={checkWindows}>
            <IconReload />
          </ActionIcon>
        </Paper>
        <Box className={classes.itemList}>
          {windowStates.map((state) => (
            <Box className={classes.item} key={state.label}>
              <Flex className={classes.itemTop}>
                <Text mr={"auto"}>{state.label}</Text>
                <ActionIcon onClick={() => closeWindow(state.label)}>
                  <IconX />
                </ActionIcon>
              </Flex>
              <Flex className={classes.itemBottom}>
                <ActionIcon
                  size={22}
                  onClick={() =>
                    setWindowAlwaysTop(state.label, !state.alwaysTop)
                  }
                >
                  <IconPictureInPicture
                    color={state.alwaysTop ? colors.indigo[5] : colors.gray[6]}
                  />
                </ActionIcon>
                <ActionIcon
                  size={22}
                  onClick={() =>
                    setWindowDecoration(state.label, !state.decorated)
                  }
                >
                  <IconAspectRatio
                    color={state.decorated ? colors.indigo[5] : colors.gray[6]}
                  />
                </ActionIcon>
                <ActionIcon
                  size={22}
                  onClick={() =>
                    setWindowIgnoreClick(state.label, !state.ignoreClick)
                  }
                >
                  {state.ignoreClick ? (
                    <IconMouseOff />
                  ) : (
                    <IconMouse color={colors.indigo[5]} />
                  )}
                </ActionIcon>
                <ActionIcon
                  size={22}
                  onClick={() =>
                    setWindowResizable(state.label, !state.resizable)
                  }
                >
                  {state.resizable ? (
                    <IconMaximize color={colors.indigo[5]} />
                  ) : (
                    <IconMaximizeOff />
                  )}
                </ActionIcon>
                <ActionIcon
                  size={22}
                  onClick={() => setWindowVisible(state.label, !state.visible)}
                >
                  {state.visible ? (
                    <IconDeviceLaptop color={colors.indigo[5]} />
                  ) : (
                    <IconDeviceLaptopOff />
                  )}
                </ActionIcon>
              </Flex>
            </Box>
          ))}
        </Box>
      </Flex>

      <Modal
        centered
        opened={opened}
        onClose={() => setOpened(false)}
        title="Open new tab"
      >
        <TextInput ref={inputRef} placeholder="url" data-autofocus />
        <Button size="xs" mt={"md"} loading={isLoading} onClick={handleUrlOpen}>
          Open
        </Button>
      </Modal>
    </>
  );
};

export default Home;
