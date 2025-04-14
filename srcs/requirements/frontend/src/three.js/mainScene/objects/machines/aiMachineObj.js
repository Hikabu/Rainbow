import { Object } from '../../../core/objectFactory/Object'
import { materialsgroup, singleMaterial, 
		part_sym_2d, part_sym_3d, 
		part_asym, part_asym_ang,
		threeCube} from '../simpleAssets';
import { StateManager } from '../../../core/stateManager/StateManager';
import { screenMaterial } from '../simpleAssets';

const object = new Object(part_sym_2d);
object.self.position.z = 3;
object.self.position.x = 0;
object.self.position.y = 2;

const aiMachineObj = object;
aiMachineObj.add_onclick(()=>{new StateManager().changeState(2);})

const partIndex = 0;
const surfaceIndex = 0;
const screenSurface = object.self.children[partIndex].children[surfaceIndex].userData.instance;
screenSurface.add_material( screenMaterial);
const center = object.self.position.clone();
center.z += 2;

export {aiMachineObj, screenSurface, center,  object, partIndex, surfaceIndex }