import { getMediaDevices } from "~/util/helpers"
import React, { useState, useEffect, useRef } from 'react';

interface DeviceProps {
  onSelect(id: any): any 
}

export const DeviceSelector = ({onSelect}: DeviceProps) => {
  const [devices, setDevices] = useState<MediaDeviceInfo[]>([])
  const selectEl = useRef<HTMLSelectElement>(null)

  const selectDevice = () => selectEl.current && onSelect(selectEl.current?.value);
    
  useEffect(() => {
    (async () => {
      const d = await getMediaDevices()
      setDevices(d)
      selectDevice()
    })()
  })

  return (
    <>
      <span className="mr-2">Select a camera:</span>
      <select ref={selectEl} title="Select Video Camera" onInput={selectDevice}>
        {devices.map((d, i) =>
          (<option key={d.deviceId} value={d.deviceId}>{d.label || `Device ${i}`}</option>))
        }
      </select>
    </>
  )
}

export default DeviceSelector