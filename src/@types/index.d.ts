type StaticPropsWithChildren<P = unknown> = P & {
  children?: ReactNode;
};

type TablerIcon = (props: TablerIconsProps) => JSX.Element;
