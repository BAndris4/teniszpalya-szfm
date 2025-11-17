// usePrice.js
import { useCallback } from "react";

const summer = {
  outside: [
    { price: 4000, student: false, morning: false },
    { price: 3600, student: true,  morning: false },
    { price: 3200, student: false, morning: true },
    { price: 2800, student: true,  morning: true },
  ],
  inside: [
    { price: 9000, student: false, morning: false },
    { price: 8600, student: true,  morning: false },
    { price: 8200, student: false, morning: true },
    { price: 7800, student: true,  morning: true },
  ],
};

const winter = {
  outside: [
    { price: null, student: false, morning: false }, 
    { price: null, student: true,  morning: false },
    { price: null, student: false, morning: true },
    { price: null, student: true,  morning: true },
  ],
  inside: [
    { price: 7000, student: false, morning: false },
    { price: 6600, student: true,  morning: false },
    { price: 6200, student: false, morning: true },
    { price: 5800, student: true,  morning: true },
  ],
};

export default function usePrice() {
  const getPrice = useCallback(
    ({ season = "summer", morning = false, student = false, outside = true }) => {
      const data = season === "summer" ? summer : winter;
      const area = outside ? data.outside : data.inside;

      if (!area) {
        return null;
      }

      const found = area.find(
        (item) => item.student === student && item.morning === morning
      );

      return found ? found.price : null; // vagy 0, ha inkább azt szeretnéd
    },
    []
  );

  return { getPrice };
}
