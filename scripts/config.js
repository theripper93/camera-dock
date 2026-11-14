const MODULE_ID = "camera-dock";
const CAMERA_SIZE = { min: 100, max: 300, step: 50 };

function applyCameraSize(size) {
    document.documentElement.style.setProperty("--camera-size", `${size}px`);
}

function cycleCameraSize(direction) {
    const size = game.settings.get(MODULE_ID, "camera-size") + direction * CAMERA_SIZE.step;
    const next = size > CAMERA_SIZE.max ? CAMERA_SIZE.min : size < CAMERA_SIZE.min ? CAMERA_SIZE.max : size;
    game.settings.set(MODULE_ID, "camera-size", next);
}

function openCharacterSheet(event) {
    const userId = event.target.closest(".camera-view")?.dataset.user;
    const actor = game.users.get(userId)?.character;
    if (!actor?.visible) return ui.notifications.warn(game.i18n.localize(`${MODULE_ID}.NoCharacter`));
    actor.sheet.render({ force: true });
}

function applyHotbarHidden(hidden) {
    document.body.classList.toggle(`${MODULE_ID}-hide-hotbar`, hidden);
    document.querySelector(`[data-camera-dock="toggle-hotbar"]`)?.setAttribute("aria-pressed", hidden);
}

function createControlButton(key, icon, label) {
    const button = document.createElement("button");
    button.type = "button";
    button.classList.add("av-control", "inline-control", "icon", "fa-solid", "fa-fw", icon);
    button.dataset.cameraDock = key;
    button.dataset.tooltip = label;
    button.ariaLabel = game.i18n.localize(label);
    return button;
}

function createSizeButton() {
    const button = createControlButton("cycle-size", "fa-arrows-alt-h", `${MODULE_ID}.CycleSize`);
    button.addEventListener("click", () => cycleCameraSize(1));
    button.addEventListener("contextmenu", (event) => {
        event.preventDefault();
        cycleCameraSize(-1);
    });
    return button;
}

function createHotbarButton() {
    const button = createControlButton("toggle-hotbar", "fa-table-cells", `${MODULE_ID}.ToggleHotbar`);
    button.setAttribute("aria-pressed", game.settings.get(MODULE_ID, "hide-hotbar"));
    button.addEventListener("click", () => game.settings.set(MODULE_ID, "hide-hotbar", !game.settings.get(MODULE_ID, "hide-hotbar")));
    return button;
}

Hooks.once("init", () => {
    game.settings.register(MODULE_ID, "camera-size", {
        scope: "client",
        config: false,
        type: Number,
        default: 200,
        onChange: applyCameraSize,
    });
    game.settings.register(MODULE_ID, "hide-hotbar", {
        scope: "client",
        config: false,
        type: Boolean,
        default: false,
        onChange: applyHotbarHidden,
    });
    applyCameraSize(game.settings.get(MODULE_ID, "camera-size"));
    applyHotbarHidden(game.settings.get(MODULE_ID, "hide-hotbar"));
});

Hooks.once("ready", () => {
    const settings = game.settings.get("core", "rtcClientSettings");
    const hasPopout = Object.values(settings.users).some((user) => user.popout);
    if (settings.dockPosition === "bottom" && !settings.hideDock && !hasPopout) return;
    const users = Object.fromEntries(Object.entries(settings.users).map(([id, user]) => [id, { ...user, popout: false }]));
    game.settings.set("core", "rtcClientSettings", { ...settings, dockPosition: "bottom", hideDock: false, users });
});

Hooks.on("renderAVConfig", (app, html) => {
    const formGroup = html.querySelector('select[name="core.rtcClientSettings.dockPosition"]')?.closest(".form-group");
    if (formGroup) formGroup.hidden = true;
    app.setPosition({ height: "auto" });
});

Hooks.on("renderCameraViews", (app, html, context, options) => {
    document.getElementById("ui-bottom")?.prepend(html);

    if (options.isFirstRender) {
        html.addEventListener("click", (event) => {
            if (event.target.closest(".player-name")) openCharacterSheet(event);
        });
    }

    const userControls = html.querySelector(":scope > .user-controls");
    if (userControls && !userControls.querySelector("[data-camera-dock]")) userControls.append(createSizeButton(), createHotbarButton());
});
