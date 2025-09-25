import React from 'react'
import warningGif from "../assets/gif/warning.gif"
function ReAttemptAnim() {
  return (<>
    <div className="reAttemptAnim-wrapper">
   <div className="loop-wrapper">
  <img src={warningGif} alt="warningGif" />
</div> 
    </div>
<div className="text-message-info">⚠️ Not recorded please re-attempt <span className="wave-container">
    <span className="wave-text">
        <span>.</span><span>.</span><span>.</span>
    </span>
</span>
</div>
</>
  )
}

export default ReAttemptAnim
