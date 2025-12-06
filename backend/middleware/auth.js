import { clerkClient } from "@clerk/express";

export const protectAdmin = async (req, res, next) => {
  try {
    const { userId } = req.auth();
    const user = await clerkClient.users.getUser(userId);
    const role = user?.privateMetadata?.role;

    if (role !== "admin") {
      return res.json({
        success: false,
        message: "Truy cập bị từ chối. Chỉ dành cho quản trị viên.",
      });
    }
    next();
  } catch (error) {
    console.log(error.message);
    return res.status(500).json({ success: false, message: error.message });
  }
};
