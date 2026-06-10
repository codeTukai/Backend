const asyncHandler = (requestHandler) => {
    return (req, res, next)=>{
        Promise.resolve(requestHandler(req, res, next)).catch((err) => next(err))
    }
}



export {asyncHandler}

// const asyncHandler = (fn) => {}
// const asyncHandler = (func) => { () => { //one function is pass to another function in this case it is a higher order function

// } }

// const asyncHandler = (fn) => () => {} 
// its meant the curly brasses remove due to return call

// const asyncHandler = (fn) => async (req, res, next) => {
//      try {
//         await fn(req,res,next)
//      } catch (error) {
//         res.status(err.code || 500).json({
//             success:false,
//             message: err.message
//         })
//      }
// }
