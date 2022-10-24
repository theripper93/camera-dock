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

Hooks.once("ready", () => {
    const rtcSett = game.settings.get("core", "rtcClientSettings")

    rtcSett.dockPosition = "bottom";
    rtcSett.hideDock = false;
    for(let [k,v] of Object.entries(rtcSett.users)){
        v.popout = false;
        rtcSett.users[k] = v;
    }

    game.settings.set("core", "rtcClientSettings", rtcSett);
})

Hooks.on("renderAVConfig", (app,html) => {
    html.find('select[name="client.dockPosition"]').closest('.form-group').hide();
    app.setPosition({height: "auto"});
})

Hooks.on("renderCameraViews", (settings) => {
    $("#ui-bottom").prepend($("#camera-views"));
    const sizeBTN = $(`<a class="av-control" data-action="cycle-video" data-tooltip="Cycle Size" style="display: block;" aria-describedby="tooltip">
    <i class="fas fa-arrows-alt-h"></i>
</a>`);
    sizeBTN.on("click", () => {
        const size = game.settings.get("camera-dock", "camera-size");
        game.settings.set("camera-dock", "camera-size", Math.max(100, (size + 50) % 400));
    });
    $(".user-controls").find("nav").append(sizeBTN);
    
});