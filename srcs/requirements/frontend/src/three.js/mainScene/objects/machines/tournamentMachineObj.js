import { Object } from '../../../core/objectFactory/Object'
import { materialsgroup, singleMaterial, 
		part_sym_2d, part_sym_3d, 
		part_asym, part_asym_ang,
		threeCube} from '../simpleAssets';
import { screenMaterial } from '../simpleAssets';
import { StateManager } from '../../../core/stateManager/StateManager';

const object = new Object(part_asym);
object.self.position.z = 3;
object.self.position.x = 4;
object.self.position.y = 2;

const tourMachineObj = object;
tourMachineObj.add_onclick(()=>{ new StateManager().changeState(3);})

const partIndex = 0;
const surfaceIndex = 0;
const screenSurface = object.self.children[partIndex].children[surfaceIndex].userData.instance;
screenSurface.add_material( screenMaterial);
const center = object.self.position.clone();
center.z += 2;
export {tourMachineObj, screenSurface, center, object, partIndex, surfaceIndex}