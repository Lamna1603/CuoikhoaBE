import jwt from 'jsonwebtoken';
import  User from '../models/User.js';

const protect = async (req, res, next) => {
      console.log('--- Inside protect middleware START ---'); // Dòng này quan trọng
    let token;
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        try {
            // Lấy token từ header
            token = req.headers.authorization.split(' ')[1];
            
              console.log('Protect: Token extracted.');

            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            
             console.log('Protect: Token verified. Decoded ID:', decoded.id, 'Role:', decoded.role);

            req.user = await User.findById(decoded.id).select('-password');
            if (!req.user) {

                 console.log('Protect: User not found for decoded ID.');

                return res.status(401).json({
                    success: false,
                    message: 'Not authorized, user not found',
                    data: {}
                });
            }

              console.log('Protect: User found and assigned to req.user:', req.user.username, req.user.role);

            next();

            console.log('Protect: Calling next().'); // Dòng này sẽ không xuất hiện nếu next() thành công

        } catch (error) {
            console.error('Token verification failed:', error);
            res.status(401)
            throw new Error('Not authorized, token failed');
        }
    }
    if (!token) {
        res.status(401)
        throw new Error('Not authorized, no token');
    }
}

const authorize = (roles) => {
  return (req, res, next) => {
    console.log('--- Inside authorize middleware START ---'); // Dòng này quan trọng
    if (!req.user) {
        console.log('Authorize: req.user is undefined. This should not happen after protect.');
        return res.status(401).json({ success: false, message: 'Not authorized, user not set.', data: {} });
    }
    if (!roles.includes(req.user.role)) {
      console.log(`Authorize: User role (${req.user.role}) not in allowed roles: ${roles.join(', ')}`);
      return res.status(403).json({ success: false, message: `User role ${req.user.role} is not authorized to access this route`, data: {} });
    }
    console.log('Authorize: User authorized. Calling next().');
    next();
  };
};


export { protect, authorize };

