import { App } from "astal/gtk3";
import style from "./styles/_style.scss";
import Bar from "./widgets/Bar";

App.start({
  css: style,
  main() {
    App.get_monitors().map(Bar);
  },
});
