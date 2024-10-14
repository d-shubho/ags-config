import { Bar } from "./widgets/bar"
import { Calendar } from "./widgets/calendar"
import { Search } from "widgets/search"
//import { NotificationPopups } from "./widgets/notification/notification_popup.ts"
// import { PowerProfile } from "./widgets/power_profile"
// import { QuickSettings } from "./widgets/quickSettings/quickSettings"
//import { Media } from "widgets/media"

// main scss file
const scss = `${App.configDir}/styles/_style.scss`
// target css file
const css = `/tmp/ags-style.css`

// make sure sassc is installed on your system
Utils.exec(`sassc ${scss} ${css}`)

App.config({
  style: css,
  windows: [
    Bar(),
    Calendar,
    Search(),
    //NotificationPopups,
    //Media
    //PowerProfile
    // QuickSettings(),
  ],
})

export { }
