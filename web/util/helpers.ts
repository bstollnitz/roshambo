

export const getMediaDevices = async (): Promise<MediaDeviceInfo[]> => {
  if(navigator.mediaDevices) {
    // Make sure the app has permission to access a video camera.
    await navigator.mediaDevices.getUserMedia({ video: true });

    // Now enumerate all the video devices.
    const items = await navigator.mediaDevices.enumerateDevices()
    return items.filter(device => device.kind === 'videoinput')
  } else {
    return []
  }
}