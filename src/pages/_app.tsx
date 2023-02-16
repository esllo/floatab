import type { AppProps } from "next/app";
import {
  MantineProvider,
  ColorScheme,
  ColorSchemeProvider,
} from "@mantine/core";
import Head from "next/head";
import { useState } from "react";
import { setCookie } from "cookies-next";

type Props = AppProps & { colorScheme: ColorScheme };

export default function App({ Component, pageProps, colorScheme }: Props) {
  const [themeScheme, setThemeScheme] = useState<ColorScheme>(colorScheme);

  const toggleThemeScheme = (value?: ColorScheme) => {
    const nextColorScheme =
      value || (colorScheme === "dark" ? "light" : "dark");
    setThemeScheme(nextColorScheme);
    setCookie("mantine-color-scheme", nextColorScheme, {
      maxAge: 60 * 60 * 24 * 30,
    });
  };

  return (
    <>
      <Head>
        <meta
          name="viewport"
          content="minimum-scale=1, initial-scale=1, width=device-width"
        />
      </Head>

      <ColorSchemeProvider
        colorScheme={themeScheme}
        toggleColorScheme={toggleThemeScheme}
      >
        <MantineProvider
          withGlobalStyles
          withNormalizeCSS
          theme={{
            colorScheme: themeScheme,
            primaryColor: "indigo",
            globalStyles: () => ({
              body: { transition: "background-color .2s" },
            }),
          }}
        >
          <Component {...pageProps} />
        </MantineProvider>
      </ColorSchemeProvider>
    </>
  );
}
