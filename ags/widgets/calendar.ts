const calendar = Widget.Calendar({
  className: "calendar_widget",
  showDayNames: true,
  showDetails: true,
  showHeading: true,
  onDaySelected: ({ date: [y, m, d] }) => {
    print(`${y}. ${m}. ${d}.`)
  },
})

const container = Widget.Box({
  children: [calendar]
})

export const Calendar = Widget.Window({
  name: "calendar",
  class_name: "calendar",
  visible: false,
  anchor: ["bottom", "left"],
  margins: [0, 0, 5, 5],
  exclusivity: "exclusive",
  child: Widget.Box({
    child: container
  }),
})
