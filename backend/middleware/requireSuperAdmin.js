const requireSuperAdmin = (req, res, next) => {
  if (!req.user || req.user.role !== "super_admin") {
    return res.status(403).json({
      success: false,
      message: "Akses ditolak. Halaman ini khusus Super Admin.",
    });
  }

  next();
};

module.exports = requireSuperAdmin;
