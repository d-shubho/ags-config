import { Client as ClientType } from "types/service/hyprland";
import { Application as ApplicationType } from "types/service/applications";
import { query, hyprland } from "services";

const availableModes = ["Apps", "Windows"];
const currentMode = Variable(availableModes[0]);

const app = (appItem: ApplicationType) => Widget.Button({
  class_name: "list_item",
  child: Widget.Box({
    children: [
      Widget.Icon({
        class_name: "icon",
        size: 40,
        icon: appItem.icon_name || ""
      }),
      Widget.Label({
        label: appItem.name
      })
    ]
  }),
  attribute: { appAttr: appItem },
  on_clicked: () => {
    App.closeWindow("search")
    appItem.launch()
  }
})

const client = (item: ClientType) => {
  return Widget.Button({
    class_name: "list_item",
    child: Widget.Label({
      label: `${item.title}`
    }),
    attribute: { addressAttr: item.address, titleAttr: item.title },
    on_clicked: () => {
      App.closeWindow("search")
      hyprland.messageAsync(`dispatch focuswindow address:${item.address}`)
    }
  })
}

function showAll() {
  if (currentMode.value === availableModes[0]) {
    AppList.children.map(app => app.visible = true)
  } else if (currentMode.value === availableModes[1]) {
    ClientList.children.map(client => client.visible = true)
  }
}


const AppList = Widget.Box({
  class_name: "app_list",
  vertical: true,
  children: query("").map(app),
})

const ClientList = Widget.Box({
  class_name: "client_list",
  vertical: true,
  children: hyprland.clients.map(client),
  setup: self => self
    .hook(hyprland, () => {
      self.children = hyprland.clients.map(client)
    }, 'client-added')
    .hook(hyprland, () => {
      self.children = hyprland.clients.map(client)
    }, 'client-removed')
})

const List = Widget.Stack({
  class_name: "list",
  children: {
    "apps": AppList,
    "clients": ClientList
  },
  shown: "apps",
  transition: "slide_left_right",
  setup: self => self.hook(currentMode, () => {
    showAll()
    if (currentMode.value === availableModes[0]) {
      self.shown = "apps"
    } else if (currentMode.value === availableModes[1]) {
      self.shown = "clients"
    }
  })
})

const ModeSelector = Widget.Box({
  class_name: "mode_selector",
  children: availableModes.map(mode => Widget.Button({
    class_name: `${mode}_mode_btn mode_btn`,
    child: Widget.Label({
      label: mode === availableModes[0] ? ` ${mode}` : `  ${mode}`,
    }),
    on_clicked: () => {
      currentMode.setValue(mode)
      Entry.grab_focus()
    },
    setup: self => self.hook(currentMode, () => {
      self.toggleClassName("active_mode", currentMode.value === mode)
    })
  }))
})

const Entry = Widget.Entry({
  class_name: "entry",
  on_accept: () => {
    if (currentMode.value === availableModes[0]) {
      const apps = AppList.children.filter(item => item.visible)

      if (apps[0]) {
        App.toggleWindow("search")
        apps[0].attribute.appAttr.launch()
      }

    } else if (currentMode.value === availableModes[1]) {
      const clients = ClientList.children.filter(item => item.visible)
      if (clients[0]) {
        App.ToggleWindow("search")
        hyprland.messageAsync(`dispatch focuswindow address:${clients[0].attribute.addressAttr}`)
      }
    }
  },
  on_change: ({ text }) => {
    //entryChanged.setValue(true)
    if (currentMode.value === availableModes[0]) {
      AppList.children.forEach(app => {
        app.visible = app.attribute.appAttr.match(text ?? "")
      })
    } else if (currentMode.value === availableModes[1]) {
      const searchText = text?.toLowerCase() || ""
      ClientList.children.forEach(client => {
        client.visible = client.attribute.titleAttr.toLowerCase().includes(searchText)
      })
    }
  },
  setup: self => self.hook(currentMode, () => {
    self.text = ""
  })
})

const SearchBox = Widget.Box({
  class_name: "search_box",
  vertical: false,
  children: [ModeSelector, Entry]
})

const Container = Widget.Box({
  class_name: "container",
  vertical: true,
  visible: true,
  children: [
    SearchBox,
    Widget.Scrollable({
      class_name: "scrollable",
      hscroll: "never",
      child: List
    })
  ],
  setup: self => self.hook(App, (_, windowName, visible) => {
    if (windowName !== "search")
      return

    currentMode.setValue(availableModes[0])

    if (visible) {
      Entry.text = ""
      Entry.grab_focus()
    }
  }, "window-toggled"),
})

const UnavailableMode = (mode: string) => Widget.Box({
  child: Widget.Label({
    label: `${mode} not available. Available modes are: ${availableModes.join(",")}.`
  })
})

const Search = (mode: string = availableModes[0]) => {
  if (!availableModes.includes(mode)) {
    return Widget.Window({
      name: "search",
      child: UnavailableMode(mode)
    })
  }

  return Widget.Window({
    name: "search",
    class_name: "search",
    child: Container,
    visible: false,
    keymode: "exclusive",
    setup: self => self
      .keybind("Escape", () => {
        App.closeWindow("search")
      })
      .keybind(["CONTROL"], "a", () => {
        currentMode.setValue(availableModes[0])
      })
      .keybind(["CONTROL"], "w", () => {
        currentMode.setValue(availableModes[1])
      })
  })
}

export { Search, availableModes }
