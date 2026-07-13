// Currency formatting only — the Truck Manager sibling app's economy.js
// also has diesel/toll/fuel-cost formulas specific to trucking; none of
// that applies here. Airlines Empire's actual money math (starter grants,
// plan costs, fares, fuel burn, maintenance) all lives on the SERVER — the
// client never computes financial outcomes, it just displays whatever the
// backend returns (see src/services/api.js). This file is just the
// Indian-style ₹ formatting helpers, reused as-is because they're pure
// display logic with nothing truck-specific in them.

// Indian-style currency formatting: ₹12,34,567
export function inr(n) {
  const neg = n < 0;
  let s = Math.round(Math.abs(n)).toString();
  if (s.length > 3) {
    const last3 = s.slice(-3);
    let rest = s.slice(0, -3);
    rest = rest.replace(/\B(?=(\d{2})+(?!\d))/g, ',');
    s = rest + ',' + last3;
  }
  return (neg ? '-₹' : '₹') + s;
}

export function inrShort(n) {
  const abs = Math.abs(n);
  if (abs >= 1e7) return (n < 0 ? '-' : '') + '₹' + (abs / 1e7).toFixed(2) + ' Cr';
  if (abs >= 1e5) return (n < 0 ? '-' : '') + '₹' + (abs / 1e5).toFixed(1) + ' L';
  return inr(n);
}
