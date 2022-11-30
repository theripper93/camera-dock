Hooks.once('init', function() {
    game.settings.register("camera-dock", "camera-size", {
        name: "",
        default: 200,
        type: Number,
        scope: "client",
        config: false,
        onChange: () => {
            document.querySelector(':root').style.setProperty('--camera-size', game.settings.get("camera-dock", "camera-size") + "px");
        },
      });
      document.querySelector(':root').style.setProperty('--camera-size', game.settings.get("camera-dock", "camera-size") + "px");
});

Hooks.once("ready", async () => {
    setTimeout(() => {
    let rtcSett = game.settings.get("core", "rtcClientSettings")

    rtcSett.dockPosition = "bottom";
    rtcSett.hideDock = false;
    for(let [k,v] of Object.entries(rtcSett.users)){
        v.popout = false;
        rtcSett.users[k] = v;
    }
    game.settings.set("core", "rtcClientSettings", rtcSett);
    }, 5000);
})

Hooks.on("renderAVConfig", (app,html) => {
    html.find('select[name="client.dockPosition"]').closest('.form-group').hide();
    app.setPosition({height: "auto"});
})

Hooks.on("renderCameraViews", (app,html) => {
    $("#ui-bottom").prepend($("#camera-views"));
    const sizeBTN = $(`<a class="av-control" data-action="cycle-video" data-tooltip="Cycle Size" style="display: block;" aria-describedby="tooltip">
    <i class="fas fa-arrows-alt-h"></i>
</a>`);
    sizeBTN.on("click", (e) => {
        const size = game.settings.get("camera-dock", "camera-size");
        const diff = e.button == 0 ? 50 : -50;
        game.settings.set("camera-dock", "camera-size", Math.max(100, (size + diff) % 400));
    });
    $(".user-controls").find("nav").append(sizeBTN);
    html.find(".player-name").each((i,el) => {
        el.onclick = (e) => {
            try{
                const userId = e.currentTarget.closest(".camera-view").dataset.user;
                const user = game.users.get(userId);
                user.character.sheet.render(true)
            }catch(e){
                ui.notifications.warn("No assigned Character found for this player");
            }
        };
    });

});