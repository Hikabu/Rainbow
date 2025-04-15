from channels.layers import get_channel_layer
from asgiref.sync import async_to_sync

def send_message(room, message):
    channel_layer = get_channel_layer()

    async_to_sync(channel_layer.group_send)(
        room_name,
        {message}
    )

def disconnect_all_from_group(group_name):
    channel_layer = get_channel_layer()

    async_to_sync(channel_layer.group_discard)(
        group_name, 
        group_name
    )