import { uponEnter } from "../..";
import { Engine } from "../overlays/scenes/pong-game/setUp/Engine";
import { MainEngine } from "./MainEngine";

export class OnLoad {
	constructor() {
		if (OnLoad.instance) return OnLoad.instance;

		this.reset()
		this.isLoadingRef = null;
		this.appVisibleRef = null;
		this.loadingOpacityRef = 1;
		this.appOpacityRef = 0;
		this.reconnecting = false;
		OnLoad.instance = this;
	}
	reset(){
		this.firstLoad = false;
		this.socket_ready = false;
		this.textures_ready = false;
		this.switched_already = false;
	}
	set_first_load(isLoadingRef, appVisibleRef, loadingOpacityRef, appOpacityRef) {
		console.log("set first load")
		this.firstLoad = true;
		this.isLoadingRef = isLoadingRef;
		this.appVisibleRef = appVisibleRef;
		this.loadingOpacityRef = loadingOpacityRef;
		this.appOpacityRef = appOpacityRef;
		this.try_switch_pages();
	}
	set_socket_ready() {
		console.log("set sockeet ready")
		this.socket_ready = true;
		this.try_switch_pages();
	}
	set_texture_ready() {
		console.log("set texture ready")
		this.textures_ready = true;
		this.try_switch_pages();
	}

	try_switch_pages() {
		if (!this.socket_ready || !this.firstLoad || !this.textures_ready || this.switched_already) return;
		console.log("switching pages")
		this.switched_already = true;

		// Start fading out loading
		gsap.to(this.loadingOpacityRef, {
			duration: 1,
			value: 0,
			ease: "power2.out",
			onComplete: () => {
				this.isLoadingRef.value = false; // hide loading div completely
				uponEnter();
				new MainEngine().resize()
				this.appVisibleRef.value = true; // show app div
				gsap.to(this.appOpacityRef, {
					duration: 1,
					value: 1,
					ease: "power2.out",
					// onComplete: () => {
					// 	uponEnter(); // whatever you want after fully loaded
					// }
				});
			}
		});
	}
	reset(){
		this.firstLoad = false;
		this.socket_ready = false;
		this.textures_ready = false;
		this.switched_already = false;
	}
}
