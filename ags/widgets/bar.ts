import { hyprland, bluetooth, network, notifications, mpris, audio, battery } from "../services.ts"

// Search Button:
const Search = Widget.Button({
  class_name: "launcher",
  child: Widget.Label({
    class_name: "launcher_label",
    label: ""
  }),
  on_clicked: () => Utils.execAsync("ags -t search")
})

// Clock:
const date = Variable("", {
  poll: [1000, 'date "+%b %e   %H:%M 󰥔 "'],
})

const Clock = Widget.Button({
  class_name: "clock",
  child: Widget.Label({
    class_name: "clock_label",
    label: date.bind()
  }),
  on_clicked: () => Utils.execAsync("ags -t calendar")
})


// Active client title
const ClientTitle = Widget.Label({
  class_name: "client_title",
  setup: self => self.hook(hyprland, () => {
    self.visible = hyprland.active.client.title.length > 0
    const title = hyprland.active.client.title
    self.label = title.length > 18 ? title.slice(0, 19) + " ..." : title
  })
})


// Workspaces:
const workspaces = {
  wsIcons: ["", "", "", "", " 地", " 水", " 火", " 風", " 空"],
  persistentWs: 4
  // first four of the wsIcons will be visually persistent on the bar(not functionally tho)
  // hyprland does have the option to set persistent workspace; see more here: https://wiki.hyprland.org/Configuring/Workspace-Rules/ )
  // rest will be treated as non-persistent;
}

// returns an array of workspace buttons
const Workspaces = Widget.Box({
  class_name: "workspaces",
  children: workspaces?.wsIcons.map((ws, i) => Widget.Button({
    child: Widget.Label(ws),
    class_name: "workspace",
    on_primary_click: () => hyprland.messageAsync(`dispatch workspace ${i + 1}`),
    setup: self => self.hook(hyprland, () => {
      if (i + 1 > workspaces?.persistentWs &&
        !(self.class_names.includes("active") || self.class_names.includes("occupied"))
      ) {
        self.visible = false
      } else {
        self.visible = true
      }
      self.toggleClassName("active", hyprland.active.workspace.id === i + 1)
      self.toggleClassName("occupied", (hyprland.getWorkspace(i + 1)?.windows || 0) > 0)
    })
  })
  )
})

// Audio
const audioIcons = ["", "", "󰕾", ""]
const Audio = Widget.Button({
  class_name: "audio",
  child: Widget.Label({
    class_name: "audio_label",
    setup: self => self.hook(audio, () => {
      const speaker = audio.speaker
      const vol = Math.round(audio.speaker.volume * 100)
      self.label = speaker.stream?.isMuted ? " "
        : vol > 100 ? `󱄠  ${vol}%`
          : ` ${audioIcons[Math.floor(vol / 30)]}  ${vol}%`
      self.toggleClassName("muted_label", speaker.stream?.isMuted)
    })
  }),
  on_scroll_up: () => Utils.execAsync('pactl -- set-sink-volume 0 +1%'),
  on_scroll_down: () => Utils.execAsync('pactl -- set-sink-volume 0 -1%'),
  on_primary_click: () => Utils.execAsync('pactl -- set-sink-mute 0 toggle')
})


// Control-center
const ControlCenter = Widget.Button({
  class_name: "control_center",
  child: Widget.Label({
    class_name: "control_center_label",
    label: "",
  })
})


// Bluetooth
const Bluetooth = Widget.Button({
  class_name: "bluetooth",
  child: Widget.Label({
    class_name: "bluetooth_label",
    setup: self => self.hook(bluetooth, () => {
      const deviceName = bluetooth.connected_devices[0]?.name.length > 8 ? bluetooth.connected_devices[0]?.name.slice(0, 9) + "..." : bluetooth.connected_devices[0]?.name
      if (bluetooth.enabled && bluetooth.connected_devices.length) {
        self.label = `󰂴  ${deviceName}`
      } else if (bluetooth.enabled) {
        self.label = "󰂯"
      } else {
        self.label = "󰂲"
      }
    })
  }),
  on_primary_click: () => hyprland.messageAsync("dispatch exec blueman-manager"),
})

// Network
const wifiIcons = {
  "0": "󰤯",
  "1": "󰤟",
  "2": "󰤢",
  "3": "󰤥",
  "4": "󰤨"
}
const Network = Widget.Button({
  class_name: "network",
  child: Widget.Label({
    class_name: "network_label",
    setup: self => self.hook(network, () => {
      const wired = network.wired
      const wifi = network.wifi
      const ssid = wifi?.ssid?.length > 8 ? wifi?.ssid.slice(0, 9) + "..." : wifi?.ssid
      if (wired.internet === "connected") {
        self.label = "󱎔  connected"
      } else if (wifi.enabled && wifi.internet === "connected") {
        self.label = wifi.strength !== -1 ? `${wifiIcons[Math.floor(wifi.strength / 20)]}  ${ssid}` : "󰤫 "
      } else if (wifi.enabled) {
        self.label = "󰤯"
      } else {
        self.label = "󰤮"
      }
    })
  }),
  on_primary_click: () => hyprland.messageAsync("dispatch exec kitty nmtui"),
})

// Notification
const Notification = Widget.Button({
  class_name: "notification",
  visible: notifications.bind("popups").as(p => p.length > 0),
  child: Widget.Label({
    label: "󱅫"
  }),
})

// Media
const Media = Widget.Button({
  class_name: "media",
  visible: mpris.bind("players").as(players => players.length > 0),
  child: Widget.Label({
    label: "󰝚"
  })
})

// Battery:
const batteryIcons = {
  "0": "󰂎",
  "1": "󰁺",
  "2": "󰁻",
  "3": "󰁼",
  "4": "󰁽",
  "5": "󰁾",
  "6": "󰁿",
  "7": "󰂀",
  "8": "󰂁",
  "9": "󰂂",
  "10": "󰁹"
}
const Battery = Widget.Button({
  class_name: "battery",
  visible: battery.bind("available"),
  child: Widget.Label({
    class_name: "battery_label",
    setup: self => self.hook(battery, () => {
      const isCharging = battery.charging
      const batteryPercent = battery.percent
      const timeRemaining = battery.time_remaining
      self.label = `${isCharging ? "󱐋" : ""} ${batteryIcons[Math.floor(batteryPercent / 10)]} ${batteryPercent}%`
      self.tooltip_text = ` ${Math.floor(timeRemaining / 3600)}hr ${Math.floor(timeRemaining / 60) % 60}min ${isCharging ? " until fully charged" : " until empty"}`
      self.toggleClassName("battery_warning", batteryPercent < 20 && batteryPercent > 10)
      self.toggleClassName("battery_critical", batteryPercent < 10)
      self.toggleClassName("battery_charging", isCharging)
    }
    )
  }),
})

// layout of the bar
const Left = Widget.Box({
  class_name: "left",
  children: [
    Search,
    Clock,
    ClientTitle,
  ],
})

const Center = Widget.Box({
  spacing: 8,
  class_name: "center",
  children: [
    Workspaces
  ],
})

const Right = Widget.Box({
  hpack: "end",
  class_name: "right",
  spacing: 8,
  children: [
    Media,
    Notification,
    ControlCenter,
    Bluetooth,
    Network,
    Audio,
    Battery
  ],
})

export const Bar = (monitor: number = 0) => Widget.Window({
  name: `bar - ${monitor}`, // name has to be unique
  class_name: "bar",
  visible: false,
  monitor,
  anchor: ["bottom", "left", "right"],
  exclusivity: "exclusive",
  child: Widget.CenterBox({
    spacing: 200,
    start_widget: Left,
    center_widget: Center,
    end_widget: Right,
  }),
})
