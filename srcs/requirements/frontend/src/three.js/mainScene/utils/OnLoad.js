export class OnLoad {
	constructor(isLoadingRef, appVisibleRef){
		if (OnLoad.instance)
			return OnLoad.instance;
		this.firstLoad = null;
		this.socket_ready = false;
		this.textures_ready = false;
		this.switched_already = false;
		this.reconnecting = false;
		this.isLoadingRef = isLoadingRef;
		this.appVisibleRef = appVisibleRef;
		OnLoad.instance = this;
	}

	set_first_load(newPage){
		this.firstLoad = newPage;
		this.switch_pages();
	}
	set_socket_ready(){
		this.socket_ready = true;
		this.switch_pages();
	}
	set_texture_ready(){
		this.textures_ready = true;
		this.switch_pages();
	}

	switch_pages(){
		if (!this.socket_ready || !this.firstLoad || !this.textures_ready || this.switched_already) {
			return;
		}
		this.switched_already = true;

		// Fade out loading screen and show app using refs
		this.isLoadingRef.value = true;
		this.appVisibleRef.value = false;

		gsap.to(this.isLoadingRef, {
			duration: 0.5,
			value: false,
			onUpdate: () => {},
			onComplete: () => {
				this.appVisibleRef.value = true;
				gsap.to(this.appVisibleRef, {
					duration: 1,
					value: true
				});
				uponEnter();
			}
		});
	}
}