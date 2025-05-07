
let friends = [
	{"avatar" : '/src/assets/fakeFriends/a1.jpg', "name" : "a1"},
	{"avatar" : '/src/assets/fakeFriends/a2.jpg', "name" : "a2"},
	{"avatar" : '/src/assets/fakeFriends/a3.jpg', "name" : "a3"},
	// {"avatar" : '/src/assets/fakeFriends/a4.jpg', "name" : "a4"},
	// {"avatar" : '/src/assets/fakeFriends/a5.jpg', "name" : "a5"},
	// {"avatar" : '/src/assets/fakeFriends/a6.jpg', "name" : "a6"},
	// {"avatar" : '/src/assets/fakeFriends/a7.jpg', "name" : "a7"},
	// {"avatar" : '/src/assets/fakeFriends/a1.jpg', "name" : "a1"},
	// {"avatar" : '/src/assets/fakeFriends/a2.jpg', "name" : "a2"},
	// {"avatar" : '/src/assets/fakeFriends/a3.jpg', "name" : "a3"},
	// {"avatar" : '/src/assets/fakeFriends/a4.jpg', "name" : "a4"},
	// {"avatar" : '/src/assets/fakeFriends/a5.jpg', "name" : "a5"},
	// {"avatar" : '/src/assets/fakeFriends/a6.jpg', "name" : "a6"},
	// {"avatar" : '/src/assets/fakeFriends/a7.jpg', "name" : "a7"},
]

export async function get_friends(index = null){
	if (friends.length == 0)
		return null;
	if (index == null)
	{
		console.log("no index")
		return friends;
	}
	else {
		console.log("index s", index)
		if (index >= friends.length)
			return null
		console.log("index", index)
		return friends[index]
	}

}

export function get_total_friends(){
	return (friends.length);
}