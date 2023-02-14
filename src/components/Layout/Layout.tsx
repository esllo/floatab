import {
  DoubleNavbar,
  Navigation,
} from "@/components/DoubleNavBar/DoubleNavBar";
import { Tabs, createStyles } from "@mantine/core";

const useStyles = createStyles(() => ({
  main: {
    display: "flex",
    flexDirection: "column",
    height: "100vh",
    userSelect: "none",
  },
  container: {
    flex: "1 1 0px",
    height: "100%",
  },
}));

interface Props {
  label: string;
  navigations: Navigation[];
  onNavigationChange: (navigation: string) => void;
}

const Layout = ({
  children,
  label,
  navigations,
  onNavigationChange,
}: StaticPropsWithChildren<Props>) => {
  const { classes } = useStyles();
  return (
    <div className={classes.main} data-tauri-drag-region>
      <DoubleNavbar
        active={label}
        navigations={navigations}
        onNavigationChange={onNavigationChange}
      />
      <div className={classes.container}>
        <Tabs sx={{ height: "100%" }} value={label}>
          {children}
        </Tabs>
      </div>
    </div>
  );
};

export default Layout;
