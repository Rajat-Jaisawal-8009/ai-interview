import React, { useRef, useState, useEffect } from "react";
import audioData from "../assets/quesAudio/quesAudio.js";
import {questionData} from "../assets/quesAudio/quesAudio.js"
import VoiceLoader from "./VoiceLoader.jsx";
import AiSpeackAnim from "./AiSpeackAnim.jsx";
import RecordDoneAnim from "./RecordDoneAnim.jsx";
import ReAttemptAnim from "./ReAttemptAnim.jsx";
import { jsPDF } from "jspdf";
import submitedGif from "../assets/gif/downloadGif.gif"
import hellogif from "../assets/gif/hellogif.gif"

function AiInterviewPage() {

  const audioRef = useRef(null);
  const [started, setStarted] = useState(false);
  const [countdown, setCountdown] = useState(3);
  const [nextQuesValue, setNextQuesValue] = useState(0);
  const [initialCountdownDone, setInitialCountdownDone] = useState(false);
  const [audioFinished, setAudioFinished] = useState(false);
  const [recognition, setRecognition] = useState(null);        
  const [listening, setListening] = useState(false);
  const [supported, setSupported] = useState(true);
  const [supportWarning, setSupportWarning] = useState("");
  const [playWarning, setPlayWarning] = useState("");
  const [finalTranscript,setFinalTranscript] = useState([])
  const [submitForm, setSubmitForm] = useState(false)


  const handleStart = () => {
    setStarted(true);
    setCountdown(3); 
  };

  
  const nextHandle = () => {
    if (audioRef.current) {
      audioRef.current.pause();       
      audioRef.current.currentTime = 0;
    }
    setNextQuesValue((prev) => prev + 1);

    setAudioFinished(false);
    // setUserTranscript("");
  };

  
  useEffect(() => {
    if (!started || initialCountdownDone) return;

    if (countdown <= 0) {
      setInitialCountdownDone(true);

      
      if (audioRef.current) {
        audioRef.current.play()
          .then(() => {
            if (audioRef.current.muted || audioRef.current.volume === 0) {
        alert("⚠️ Audio is muted in your browser/tab. Please unmute to hear sound.");
        setPlayWarning("⚠️ Audio is muted in your browser/tab. Please unmute to hear sound.");
      } else {
        setPlayWarning("");
    
      }
          })
          .catch((err) => {
             if (err.name === "NotAllowedError" || err.name === "AbortError") {
      alert("⚠️ Audio play blocked by browser. Please click the button to start the audio.");
      setPlayWarning("⚠️ Audio play blocked by browser. Please click the button to start the audio.")
    } else if (err.name === "NotSupportedError") {
      alert("⚠️ Your browser does not support audio playback.");
      setPlayWarning("⚠️ Your browser does not support audio playback.")
    } else {
      alert("⚠️ Audio could not be played. Please check your internet or try again.");
      setPlayWarning("⚠️ Audio could not be played. Please check your internet or try again.")
    }
          });
      }
      return;
    }

    const timer = setInterval(() => {
      setCountdown((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [started, countdown, initialCountdownDone]);



  useEffect(() => {
    if (nextQuesValue === 0) return; 
    const audioEl = audioRef.current;
    if (!audioEl) return;

    const handleCanPlay = () => {
      audioEl.play()
        .then(() => {
            if (audioRef.current.muted || audioRef.current.volume === 0) {
        alert("⚠️ Audio is muted in your browser/tab. Please unmute to hear sound.");
        setPlayWarning("⚠️ Audio is muted in your browser/tab. Please unmute to hear sound.");
      } else {
        setPlayWarning("");
      
      }
          })
          .catch((err) => {
             if (err.name === "NotAllowedError" || err.name === "AbortError") {
      alert("⚠️ Audio play blocked by browser. Please click the button to start the audio.");
      setPlayWarning("⚠️ Audio play blocked by browser. Please click the button to start the audio.")
    } else if (err.name === "NotSupportedError") {
      alert("⚠️ Your browser does not support audio playback.");
      setPlayWarning("⚠️ Your browser does not support audio playback.")
    } else {
      alert("⚠️ Audio could not be played. Please check your internet or try again.");
      setPlayWarning("⚠️ Audio could not be played. Please check your internet or try again.")
    }
          });
    };

    audioEl.addEventListener("canplay", handleCanPlay);

    return () => {
      audioEl.removeEventListener("canplay", handleCanPlay);
    };
  }, [nextQuesValue]);


 const handleEnded = () => {
  
      setAudioFinished(true);

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setSupported(false);
      setSupportWarning(
        "⚠️ Your browser does not support Speech Recognition. Please use Chrome/Edge."
      );
        // alert("⚠️ Your browser does not support Speech Recognition. Please use Chrome/Edge.")
      return;
    }else{
       setSupported(true);
      setSupportWarning(
        ""
      );
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = "en-US"

      let silenceTimer;
  let accumulatedTranscript = ""; 
 const resetSilenceTimer = () => {
    if (silenceTimer) clearTimeout(silenceTimer);
    silenceTimer = setTimeout(() => {
      recognition.stop();
      setListening(false);
    
      if (accumulatedTranscript.trim() !== "") {
        setFinalTranscript(prev => [...prev, accumulatedTranscript.trim()]);
      }
    }, 4000);
  };


  recognition.onresult = (event) => {

    let interimTranscript = "";
    for (let i = event.resultIndex; i < event.results.length; i++) {
      const result = event.results[i][0].transcript;
      interimTranscript += result;
      if (event.results[i].isFinal) {
      setFinalTranscript(prev => {
        const copy = [...prev];
        copy[nextQuesValue] = (copy[nextQuesValue] || '') + result + ' ';
        return copy;
      });
      }
    }

    // setUserTranscript(accumulatedTranscript + interimTranscript); 
    resetSilenceTimer(); 
  };
    recognition.onerror = (event) => {
        if(event.error === "not-allowed" || event.error === "service-not-allowed") {
           setSupported(false);
           setSupportWarning(
       "⚠️ Microphone access denied. Please allow microphone permission."
      );
    // alert("⚠️ Microphone access denied. Please allow microphone permission.");
    setListening(false);
  } else if(event.error === "network") {
           setSupported(false);
           setSupportWarning(
       "⚠️ Network error in Speech Recognition."
      );
    alert("⚠️ Network error in Speech Recognition.");
  } else if(event.error === "aborted") {
     setSupported(false);
           setSupportWarning(
      "Recognition aborted.")

  }

    };





   recognition.start()
    setListening(true);
    setRecognition(recognition);
      resetSilenceTimer();
    };


///////////////
   useEffect(() => {
    const audioEl = audioRef.current;
    if (!audioEl) return;

    audioEl.addEventListener("ended", handleEnded);

    return () => {
      audioEl.removeEventListener("ended", handleEnded);
      setAudioFinished(false);
    };
  }, [nextQuesValue]);

const clearAndReTry = () => {
  
  setFinalTranscript(prev => {
    const copy = [...prev];
    copy[nextQuesValue] = ''; 
    return copy;
  });

  
  // setUserTranscript("");

  
  if (recognition) {
    recognition.abort();
  }

  
  handleEnded();
};

const repeatAudio = () => {
  if (!audioRef.current) return;

  
  if (recognition) {
    recognition.abort();
    setListening(false);
  }

  
  // setUserTranscript("");

  
  setFinalTranscript(prev => {
    const copy = [...prev];
    copy[nextQuesValue] = '';
    return copy;
  });

  
  audioRef.current.pause();
  audioRef.current.currentTime = 0;
  setAudioFinished(false);

  
  audioRef.current.play() .then(() => {
            if (audioRef.current.muted || audioRef.current.volume === 0) {
        alert("⚠️ Audio is muted in your browser/tab. Please unmute to hear sound.");
        setPlayWarning("⚠️ Audio is muted in your browser/tab. Please unmute to hear sound.");
      } else {
        setPlayWarning("");

      }
          })
          .catch((err) => {
             if (err.name === "NotAllowedError" || err.name === "AbortError") {
      alert("⚠️ Audio play blocked by browser. Please click the button to start the audio.");
      setPlayWarning("⚠️ Audio play blocked by browser. Please click the button to start the audio.")
    } else if (err.name === "NotSupportedError") {
      alert("⚠️ Your browser does not support audio playback.");
      setPlayWarning("⚠️ Your browser does not support audio playback.")
    } else {
      alert("⚠️ Audio could not be played. Please check your internet or try again.");
      setPlayWarning("⚠️ Audio could not be played. Please check your internet or try again.")
    }
          });

  
  const handleAudioEnd = () => {
    audioRef.current.removeEventListener("ended", handleAudioEnd);
    handleEnded(); 
  };
  audioRef.current.addEventListener("ended", handleAudioEnd);
};

const isNextDisabled = () => {
  const answer = finalTranscript[nextQuesValue];
  return !audioFinished || listening || !answer || answer.trim().length === 0;
};




useEffect(()=>{
  if(finalTranscript.length>0 && finalTranscript[0].length>0){
     sessionStorage.removeItem("result");
     sessionStorage.setItem("result", JSON.stringify(finalTranscript));
  }

},[finalTranscript])



const submitHandle = ()=>{

  const submitForm =()=>{
setSubmitForm(true)
  }
   if(audioData.length-1 === nextQuesValue){
    
return (<div>{finalTranscript[audioData.length-1]?.length > 0 ?<button  onClick={submitForm}  className="Repeat-btn-wrap">Submit</button>: <button className="disable-btn">Submit</button>}</div>)
   }else{
    return false;
   }
}

const aiReadingText = ()=>{
    const answer = finalTranscript[nextQuesValue];
  if(!audioFinished){
  return <><AiSpeackAnim/></>
  }else if(listening){
  return <><VoiceLoader/></>
  }
  
  if(!audioFinished || listening || (!answer || answer?.trim()?.length === 0)){
    return <><ReAttemptAnim/></>
  }else{
      return <><RecordDoneAnim/></>
  }
}


function downloadTXT() {

   const quesData =  questionData;

   const storedName = sessionStorage.getItem("result")||[];
  
      let resultArray = JSON.parse(storedName)


    const doc = new jsPDF();
    doc.setFont("helvetica", "normal");

    quesData.forEach((item, i) => {
      doc.setTextColor(0, 0, 0);
      doc.text(`${i + 1}. Qus: ${item}`, 10, 20 + i * 20);

      doc.setTextColor(0, 0, 200);
      doc.text(`    Ans: ${resultArray[i]}`, 10, 30 + i * 20);
    });

    doc.save("result.pdf");
}



const errorPopuo = ()=>{
  if(!supported || supportWarning !== ""){
return (<div className="errorPop-up"><p>{supportWarning}</p></div>)
  }else if(playWarning !== ""){
return <div className="errorPop-up"><p>{playWarning}</p></div>
  }else{
    return false;
  }
}




   return (
    <div className="main-page">
  
      {!started ? (
        <div className="start-text-message-wrap">
          <div className="helloGif-wrap"><img src={hellogif} alt="hellogif" /></div>
          <div className="tart-text-message"><p>Step into your AI Web Development interview – prove your expertise!
        </p></div>
        <button className="start-button" onClick={handleStart}>  ▶️  Start AI Interview
        </button>
        </div>
      ) : (
        <div> {!initialCountdownDone && countdown > 0 ? 
        ( <p className="Interview-countDown-text"><div className="text-message-info"><span className="wave-container">Ai Interview will start in <strong>{countdown}</strong> seconds <span className="wave-text">
        <span>.</span><span>.</span><span>.</span>
    </span>
</span>
</div></p> )
         : 
         !submitForm ?(<div>
          <div className="voise-animation-wraper">
        
            {aiReadingText()}
                {errorPopuo()}
            </div>
          <div className="control-btn-wraper">
          <div className="Repeat-btn-wrap">{ !audioFinished?<button className="disable-btn" disabled>Repeat</button>:<button onClick={repeatAudio} >Repeat</button>}</div>
          <div className="Re-attempt-btn-wrap">{(!audioFinished || listening)?<button className="disable-btn" disabled>Re-attempt</button>:<button onClick={clearAndReTry}>Re-attempt</button>}</div>
          {submitHandle()||<div  className="next-btn-wrap" >{(!audioFinished || listening || isNextDisabled())? <button className="disable-btn" disabled>Next</button>:<button onClick={nextHandle} >Next</button>}</div>}
          </div>
          </div>)
          :
          (<div className="submited-download">
            <div className="submitedGif"><img src={submitedGif} alt="submitedGif" /></div>
            <button onClick={downloadTXT}>Download Result</button> 
            </div>)
  }
        </div>
      )}

      <audio ref={audioRef} src={audioData[nextQuesValue]} />
    </div>
  );



}

export default AiInterviewPage;
