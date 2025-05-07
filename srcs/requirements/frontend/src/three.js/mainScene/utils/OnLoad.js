import { uponEnter } from "../..";
import { StateManager } from "../../core/stateManager/StateManager";

export class OnLoad{
	constructor(){
		if (OnLoad.instance)
			return OnLoad.instance;
		// console.log("NEW ONLAOD INSTANCE!!!!")
		this.firstLoad = null;
		this.socket_ready = false;
		this.textures_ready = false;
		this.switched_already = false;
		this.reconnecting = false;
		OnLoad.instance = this;
	}
	set_first_load(newPage){
		// console.log("FIRST LOAD")
		this.firstLoad = newPage;
		this.switch_pages()
	}
	set_socket_ready(){
		// console.log("SOCKET READY")
		this.socket_ready = true;
		this.switch_pages()
	}
	set_texture_ready(){
		// console.log("TEXTURES READY")
		this.textures_ready = true;
		this.switch_pages()
	}
	switch_pages(){
		if (this.socket_ready == false)
		{
			// console.log("sokcet not ready")
			return
		}
		if (this.firstLoad == null)
		{
			// console.log("first load nto ready")
			return;
		}
		if (this.textures_ready == false)
		{
			// console.log("textures nto ready")
			return;
		}
		if (this.switched_already == true){
			// console.log("switched already ...")
			return;
		}
		this.switched_already = true;
			//  || this.firstLoad == null || this.textures_ready == false || this.switched_already == true)
			// return;
		//RAINBOW:
		//this.firstLoad = true;
		//TEST ENV:
	const loadingScreen = document.getElementById("loading-screen");
	loadingScreen.style.display = "flex";
	loadingScreen.style.opacity = 1;
	document.getElementById("app-container").style.display = "none";
	// setTimeout(() => {
		gsap.to(loadingScreen, {
			duration: 0.5,
			opacity: 0,
			onComplete: () => {
				loadingScreen.style.display = "none";
				const appContainer = document.getElementById("app-container");
				appContainer.style.opacity = 0;
				appContainer.style.display = "block";
				uponEnter();
				gsap.to(appContainer, {
					duration: 1,
					opacity: 1
				});
			}
		});
	// }, 1000);
	}
}