const hyprland = await Service.import("hyprland")
const bluetooth = await Service.import("bluetooth")
const network = await Service.import("network")
const { wifi } = await Service.import("network")
const { query } = await Service.import("applications")
const notifications = await Service.import("notifications")
const mpris = await Service.import("mpris")
const audio = await Service.import("audio")
const battery = await Service.import("battery")
//const power = await Service.import("powerprofiles")

export {
  hyprland,
  bluetooth,
  network,
  wifi,
  query,
  notifications,
  mpris,
  audio,
  battery,
  //power
}
