export const dateFormat = (date) => {
  return new Date(date).toLocaleDateString("vi-VN", {
    weekday: "short",
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "numeric",
    minute: "numeric",
  });
};
