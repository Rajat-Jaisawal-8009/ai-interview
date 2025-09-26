import React from 'react'
import acceptedgif from "../assets/gif/accepted.gif"
function RecordDoneAnim() {
  return (<>
<div className="success-checkmark">
 <img src={acceptedgif} alt="acceptedgif" />
</div>

<div className="text-message-info"> <span className='emoji-icons'>✅ </span> Well done! Go to the next question <span className="wave-container">
    <span className="wave-text">
        <span>.</span><span>.</span><span>.</span>
    </span>
</span>
</div>

</>
  )
}

export default RecordDoneAnim
