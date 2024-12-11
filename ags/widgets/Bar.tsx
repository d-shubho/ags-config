import { App, Astal, Gdk, Gtk } from "astal/gtk3"
import { bind, Variable } from "astal"
import AstalHyprland from "gi://AstalHyprland"
import AstalMpris from "gi://AstalMpris"
import AstalNotifd from "gi://AstalNotifd"
import AstalBattery from "gi://AstalBattery"
import AstalBluetooth from "gi://AstalBluetooth"
import AstalNetwork from "gi://AstalNetwork"
import AstalWp from "gi://AstalWp"
import { Button } from "../../../../../usr/share/astal/gjs/gtk3/widget"


const time = Variable("").poll(1000, "date +'%a  %d/%m/%Y 󰥔 %I:%M%p'")
const hyprland = AstalHyprland.get_default()
const mpris = AstalMpris.get_default()
const notifd = AstalNotifd.get_default()
const battery = AstalBattery.get_default()
const bluetooth = AstalBluetooth.get_default()
const network = AstalNetwork.get_default()
const audio = AstalWp.get_default()?.audio.defaultSpeaker

// Search for apps and windows
function Search() {
  return (
    <button className="launcher">
      <label className="launcher_label" label="" />
    </button>
  )
}
// Clock
function Clock() {
  return (
    <button className="clock">
      <label className="clock_label" label={time(t => `${t}`)} />
    </button>
  )
}
// Focused client title
function ClientTitle() {
  return (
    <label
      className="client_title"
      setup={self => self.hook(hyprland, "event", () => {
        const title = hyprland.get_focused_client()?.title || ""
        self.visible = title.length > 0
        self.label = title.length > 18 ? title.slice(0, 19) + "..." : title
      })}
    />
  )
}

// Workspaces
const workspaces = {
  wsIcons: ["", "", "", "", " 地", " 水", " 火", " 風", " 空"],
  persistentWs: 4
  // tightly coupled with my hyprland config for workspaces
  // first four of the wsIcons will be "visually"(need to setup hyprland workspace along with  this) persistent on the bar(not "functionally" tho)
  // hyprland does have the option to set persistent workspace; see more here: https://wiki.hyprland.org/Configuring/Workspace-Rules/ )
  // rest will be treated as non-persistent;
}
function Workspaces() {
  return (
    <box className="workspaces">

      {workspaces.wsIcons.map((ws, i) => (
        <button
          className="workspace"
          onClicked={() => hyprland.dispatch("workspace", `${i + 1}`)}
          setup={self => self.hook(hyprland, "event", () => {
            self.toggleClassName("focused", hyprland.get_focused_workspace()?.id === i + 1)
            self.toggleClassName("occupied", (hyprland.get_workspace(i + 1)?.get_clients().length || 0) > 0)

            if (i + 1 > workspaces.persistentWs &&
              !(self.get_class_name().includes("focused") || self.get_class_name().includes("occupied"))
            ) {
              self.visible = false
            } else {
              self.visible = true
            }
          })}
        >
          <label label={ws} />
        </button>
      ))
      }
    </box >
  )
}

// Media
function Media() {
  const players = bind(mpris, 'players')
  return (
    <button className="media" visible={players.as(p => p.length > 0)} >
      <label label="󰝚" />
    </button>
  )
}

// Notification
function Notification() {
  const notification = bind(notifd, "notifications")
  return (
    <button className="notification" visible={notification.as(n => n.length > 0)}>
      <label label="󱅫" />
    </button>
  )
}

// Battery
function Battery() {
  const deviceType = battery.get_device_type()
  let icon: string
  let tooltip: string
  if (deviceType !== AstalBattery.Type.BATTERY) {
    icon = battery.get_device_type_icon()
    tooltip = battery.get_device_type_name()
  } else {
    icon = battery.get_battery_icon_name()
    if (battery.charging) {
      tooltip = `${Math.floor(battery.timeToFull / 3600)}hr ${Math.floor(battery.timeToFull / 60) % 60}min until fully charged`
    } else {
      tooltip = `${Math.floor(battery.timeToEmpty / 3600)}hr ${Math.floor((battery.timeToEmpty / 60) % 60)}min until empty`
    }
  }

  return (
    <button
      className="battery"
      tooltipText={tooltip}
      setup={self => self.hook(battery, "notify", () => {
        if (deviceType !== AstalBattery.Type.BATTERY) {
          self.tooltipText = battery.get_device_type_name()
          return
        }
        if (battery?.charging) {
          self.tooltipText = `${Math.floor(battery.timeToFull / 3600)}hr ${Math.floor((battery.timeToFull / 60) % 60)}min until fully charged`
          return
        } else {
          self.tooltipText = `${Math.floor(battery.timeToEmpty / 3600)}hr ${Math.floor((battery.timeToEmpty / 60) % 60)}min until empty`
          return
        }
      })}
    >
      <icon icon={icon} iconSize={8} setup={self => self.hook(battery, "notify", () => {
        if (deviceType !== AstalBattery.Type.BATTERY) {
          self.icon = battery.get_device_type_icon()
          return
        }
        self.icon = battery.get_battery_icon_name()
        return
      })} />
    </button >
  )
}

// QuickSettings
function QuickSettings() {
  return (
    <button className="quick_settings">
      <label className="quick_settings_label" label="" />
    </button >
  )
}

// Bluetooth
function Bluetooth() {
  const blueIcons = ["󰂯", "󰂱", "󰂲"]
  let bluetoothIcon: string
  if (bluetooth.isConnected) {
    bluetoothIcon = blueIcons[1]
  } else if (bluetooth.is_powered) {
    bluetoothIcon = blueIcons[0]
  } else {
    bluetoothIcon = blueIcons[2]
  }
  const isRevealed: Variable<boolean> = Variable(false)
  return (
    <button
      className="bluetooth"
      onClick={() => hyprland.dispatch("exec", "kitty nmtui")}
      onHover={() => isRevealed.set(true)}
      onHoverLost={() => isRevealed.set(false)}
    >
      <box>
        <label
          className="bluetooth_icon"
          label={bluetoothIcon}
          setup={self => self.hook(bluetooth, "notify", () => {
            if (bluetooth.isConnected) {
              self.label = blueIcons[1]
            } else if (bluetooth.is_powered) {
              self.label = blueIcons[0]
            } else {
              self.label = blueIcons[2]
            }
          })} />
        <revealer
          revealChild={bind(isRevealed)}
          transitionType={Gtk.RevealerTransitionType.SLIDE_LEFT}
        >
          <label
            className="bluetooth_label"
            visible={bind(isRevealed)}
            label={!bluetooth.isPowered ? "off" : (
              bluetooth.isConnected ? bluetooth.get_devices()[0].name : "on"
            )}
            setup={self => self.hook(bluetooth, "notify", () => {
              self.label = !bluetooth.isPowered ? "off" : (
                bluetooth.isConnected ? bluetooth.get_devices()[0].name : "on"
              )
            })
            }
          />
        </revealer>

      </box>
    </button>
  )
}
// Network
function Network() {
  const wired = network.wired
  const wifi = network.wifi
  let networkIcon: string
  if (wired?.get_state() === AstalNetwork.DeviceState.ACTIVATED) {
    networkIcon = wired.iconName
  } else {
    networkIcon = wifi?.iconName
  }
  const isRevealed: Variable<boolean> = Variable(false)
  return (
    <button
      className="network"
      onClick={() => hyprland.dispatch("exec", "kitty nmtui")}
      onHover={() => isRevealed.set(true)}
      onHoverLost={() => isRevealed.set(false)}
    >
      <box>
        <icon className="network_icon" icon={networkIcon} setup={self => self.hook(network, "notify", () => {
          if (wired?.get_state() === AstalNetwork.DeviceState.ACTIVATED) {
            self.icon = wired.iconName
          } else {
            self.icon = wifi?.iconName
          }
        })} />
        <revealer
          revealChild={bind(isRevealed)}
          transitionType={Gtk.RevealerTransitionType.SLIDE_LEFT}
        >
          <label
            className="network_label"
            label={
              !wifi.get_enabled() ? "off" : (wifi.state === AstalNetwork.DeviceState.ACTIVATED ? wifi.ssid : "on")
            } visible={bind(isRevealed)}
            setup={self => self.hook(network, "notify", () => {
              if (wired?.get_state() === AstalNetwork.DeviceState.ACTIVATED) {
                self.label = "connected to ethernet"
              } else {
                self.label = !wifi.get_enabled() ? "off" : (wifi.state === AstalNetwork.DeviceState.ACTIVATED ? wifi.ssid : "on")
              }
            })}
          />
        </revealer>
      </box>
    </button >
  )
}

// Audio
function Audio() {
  return (
    <button className="audio"
      onClick={() => {
        if (audio?.mute) {
          return audio.set_mute(false)
        }
        return audio?.set_mute(true)
      }}
      onScroll={(_: any, { delta_y }: any) => {
        const volume_change = delta_y < 0 ? 0.05 : -0.05
        audio?.set_volume(audio.get_volume() + volume_change)
      }}
    >
      <icon
        className="audio_icon"
        setup={self => {
          if (audio) {
            self.hook(audio, "notify", () => {
              self.icon = audio.get_volume_icon()
              self.tooltipText = `${(Math.floor(audio?.volume * 100))}%`
            })
          }
        }}
      />
    </button>
  )
}

// Left
function Left() {
  return (
    <box className="left">
      <Search />
      <Clock />
      <ClientTitle />
    </box>
  )
}

// Center
function Center() {
  return (
    <box className="center"><Workspaces /></box>
  )
}

function Right() {
  return (
    <box className="right" spacing={8} halign={Gtk.Align.END}  >
      <Media />
      <Notification />
      <QuickSettings />
      <Bluetooth />
      <Network />
      <Audio />
      <Battery />
    </box>
  )
}

export default function Bar(gdkmonitor: Gdk.Monitor) {
  return (
    <window
      name="Bar"
      className="Bar"
      gdkmonitor={gdkmonitor}
      exclusivity={Astal.Exclusivity.EXCLUSIVE}
      anchor={Astal.WindowAnchor.BOTTOM
        | Astal.WindowAnchor.LEFT
        | Astal.WindowAnchor.RIGHT}
      application={App}
    >
      <centerbox spacing={200}>
        <Left />
        <Center />
        <Right />
      </centerbox>
    </window>
  )
}
