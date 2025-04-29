import * as THREE from 'three';

function dispose_object(object){
	if (object instanceof THREE.Mesh) {
		if (object.geometry) object.geometry.dispose();
		if (object.material) {
			if (Array.isArray(object.material)) {
				object.material.forEach(mat => mat.dispose());
			} else {
				object.material.dispose();
			}
		}
	} else if (object instanceof THREE.Group) {
		object.children.forEach(child => {dispose_object(child)});
		object.clear();
	}
}


function order_path(points){
	let start = [-100, 100];
	let start_index;
	for (let i = 0; i < points.length; i++)
	{
		if (points[i][1] < start[1] || (points[i][1] == start[1] && points[i][0] > start[0]))
		{
			start[0] = points[i][0];
			start[1] = points[i][1];
			start_index = i;
		}
	}
	const ordered = [];
	const next = start_index + 1 < points.length ? points[start_index + 1] : points[0];
	const prev = start_index - 1 > 0 ? points[start_index - 1] : points[points.length - 1];
	if (next[0] > prev[0]) 
	{
		let max = points.length;
		for (let i = start_index; i < max; i++){
			ordered.push(points[i]);
			if (i + 1 == points.length)
			{
				max = start_index;
				i = -1;
			}
		}
	}
	else {
		let max = -1;
		for (let i = start_index; i > max; i--){
			ordered.push(points[i]);
			if (i - 1 < 0)
			{
				max = start_index;
				i = points.length;
			}
		}
	}
	return ordered;
}

function update_min_max(points, limits){
	if (!limits)
		limits = { "min" : [100, 100, 100], "max": [-100, -100, -100]};
	if (!(points[0] instanceof THREE.Vector3))
	{
		for (let i = 0; i < points.length; i++)
			{
				for (let j = 0; j < points[i].length; j ++)
				{
					if (points[i][j] < limits.min[j])
						limits.min[j] = points[i][j];
					if (points[i][j] > limits.max[j])
						limits.max[j] = points[i][j]
				}
			}
	}
	else
	{
		points.forEach((p, i) => {
			if (p.x < limits.min[0]) limits.min[0] = p.x;
			else if (p.x > limits.max[0]) limits.max[0] = p.x;
			if (p.y < limits.min[1]) limits.min[1] = p.y;
			else if (p.y > limits.max[1]) limits.max[1] = p.y;
			if (p.z < limits.min[2]) limits.min[2] = p.z;
			else if (p.z > limits.max[2]) limits.max[2] = p.z;
		})
	}
	return limits;
}

function centerLimits(limits)
{
	let result = [0, 0, 0];
	for (let j = 0; j < 3; j ++)
		result[j] = ((limits.max[j] - limits.min[j]) / 2)- limits.max[j];
	return result;
}

function update_values(points, center){
	let new_values = [];
	for (let i = 0; i < points.length; i++)
	{
		for (let j = 0; j < 3; j ++)
			points[i][j] += center[j];
		new_values.push(points[i]);
	}
	return new_values;

}
function mapToCenter(pointsLeft, pointsRight)
{
	let old = { min :[100,100, 100], max: [-100, -100, -100]};
	old = update_min_max(pointsLeft, old);
	if (Array.isArray(pointsRight))
		old = update_min_max(pointsRight, old);
	else
		old.max.z = old.min.z + pointsRight;
	let centered = centerLimits(old);
	pointsLeft = update_values(pointsLeft, centered);
	if (! Array.isArray(pointsRight))
		return pointsLeft;
	pointsRight = update_values(pointsRight, centered);
	return {"left" : pointsLeft, "right": pointsRight};
}

async function getUserID() {
	//return Date.now()
	return 1
}

export { order_path, mapToCenter, update_min_max, dispose_object, getUserID};