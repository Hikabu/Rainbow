from uuid import uuid4, uuid1
from rest_framework.decorators import api_view
from rest_framework.response import Response

@api_view(['POST'])
def	get_userID(request):
	if request.method == 'POST':
		userID = str(uuid1())
	return Response({"result":userID})
