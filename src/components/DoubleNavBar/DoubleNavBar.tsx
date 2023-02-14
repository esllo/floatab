import { useState } from "react";
import { createStyles, UnstyledButton, Tooltip } from "@mantine/core";

export interface Navigation {
  icon: TablerIcon;
  label: string;
}

const useStyles = createStyles((theme) => ({
  wrapper: {
    display: "flex",
    flexDirection: "column",
    height: "60px",
    userSelect: "none",
  },

  aside: {
    flex: "0 0 60px",
    padding: "0 4px",
    backgroundColor:
      theme.colorScheme === "dark" ? theme.colors.dark[7] : theme.white,
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    borderBottom: `1px solid ${
      theme.colorScheme === "dark" ? theme.colors.dark[7] : theme.colors.gray[3]
    }`,
  },

  main: {
    flex: 1,
    backgroundColor:
      theme.colorScheme === "dark"
        ? theme.colors.dark[6]
        : theme.colors.gray[0],
  },

  mainLink: {
    width: 44,
    height: 44,
    borderRadius: theme.radius.md,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color:
      theme.colorScheme === "dark"
        ? theme.colors.dark[0]
        : theme.colors.gray[7],

    "&:hover": {
      backgroundColor:
        theme.colorScheme === "dark"
          ? theme.colors.dark[5]
          : theme.colors.gray[0],
    },
    margin: "0 4px",
  },

  mainLinkActive: {
    "&, &:hover": {
      backgroundColor: theme.fn.variant({
        variant: "light",
        color: theme.primaryColor,
      }).background,
      color: theme.fn.variant({ variant: "light", color: theme.primaryColor })
        .color,
    },
  },
}));

interface Props {
  active: string;
  navigations: Navigation[];
  onNavigationChange: (navigation: string) => void;
}

export function DoubleNavbar({
  active,
  navigations,
  onNavigationChange,
}: Props) {
  const { classes, cx } = useStyles();

  const handleNavigationChange = (navigation: string) => {
    return () => {
      onNavigationChange(navigation);
    };
  };

  const mainLinks = navigations.map((link) => (
    <Tooltip
      label={link.label}
      position="bottom"
      withArrow
      transitionDuration={0}
      key={link.label}
    >
      <UnstyledButton
        onClick={handleNavigationChange(link.label)}
        className={cx(classes.mainLink, {
          [classes.mainLinkActive]: link.label === active,
        })}
      >
        <link.icon stroke={1.5} />
      </UnstyledButton>
    </Tooltip>
  ));

  return <div className={classes.aside}>{mainLinks}</div>;
}
