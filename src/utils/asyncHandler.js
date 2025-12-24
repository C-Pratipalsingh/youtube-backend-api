//NOTE: dont use 'err' arg along with req, res, next because it assumes that it is a error handling middleware
//(req, res, next) => { ... }
//→ Used for routes like .get(), .post(), etc.
//(err, req, res, next) => { ... }
//→ Only called when there's an error passed via next(err)


const asyncHandler = (requestHandler) => {
    return (req, res, next) => {
        Promise.resolve(requestHandler(req, res, next)).catch((err) => next(err));
    }
}

export { asyncHandler }

/*
const asyncHandler = (fn) => async (err, req, res, next) => {
    try {
        await fn(req, res, next);
    } catch(err) {
        res.status(err.code || 500).json({
        success: false,
        msg: err.message
        }) 
    }
}
*/