import { MainEngine } from './mainScene/utils/MainEngine';
import { StateManager } from './core/stateManager/StateManager';

import { mainState } from './mainScene/states/mainMenuState';
import { localMachineState } from './mainScene/states/localMachineState';
import { aiMachineState } from './mainScene/states/aiMachineState';
import { tourMachineState } from './mainScene/states/tournamentMachineState';

import { backBox } from './mainScene/objects/background/backBox';
import { localMachineObj } from './mainScene/objects/machines/localMachineObj';
import { aiMachineObj } from './mainScene/objects/machines/aiMachineObj';
import { tourMachineObj } from './mainScene/objects/machines/tournamentMachineObj';

import { Socket } from './mainScene/utils/Socket';

export async function init(app_container) {
    new MainEngine().add_container(app_container);
}
(async () => {
    const socket = new Socket();
	await socket.init();

}) ();

	const engine = new MainEngine();
	engine.add(backBox, false);
    engine.add(localMachineObj, true);
    engine.add(aiMachineObj, true);
    engine.add(tourMachineObj, true);

	engine.add_state_manager(new StateManager(
					[
						mainState, 
						localMachineState,
						aiMachineState,
						tourMachineState,
					]));
			
    // Initialize Socket and StateManager after engine setup

    // Start the animation loop
    function animate() {
        requestAnimationFrame(animate);
        engine.animate();
    }

    animate();

// Start initialization process
