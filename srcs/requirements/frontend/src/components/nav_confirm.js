let nav_id = null

export function nav_request(path){
	console.log("req to go", path.name)
	nav_id=`to-${path.name}`
	console.log("new nav id: ", nav_id)
}

export function get_nav_id(){
	return nav_id;
}