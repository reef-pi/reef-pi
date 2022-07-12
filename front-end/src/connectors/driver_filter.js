// https://github.com/reef-pi/hal/blob/main/driver.go#L22
export const byCapability = (cap) => {
  return (driver) => {
    for (const pcap in driver.pinmap) {
      if (cap === pcap) {
        return true
      }
    }
    return false
  }
}
