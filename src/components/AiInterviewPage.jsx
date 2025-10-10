import React, { useRef, useState, useEffect, Children } from "react";
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
  const [listening, setListening] = useState(false);
  const [supported, setSupported] = useState(true);
  const [supportWarning, setSupportWarning] = useState("");
  const [playWarning, setPlayWarning] = useState("");
  const [finalTranscript,setFinalTranscript] = useState([])
  const [submitForm, setSubmitForm] = useState(false)
const textRef = useRef()

const recognitionRef = useRef(null)
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768); 
    };

    window.addEventListener("resize", handleResize);

    return () => window.removeEventListener("resize", handleResize);
  }, []);


//// Get SpeechRecognition Object
useEffect(()=>{
 const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setSupported(false);
      setSupportWarning(
        "⚠️ Your browser does not support Speech Recognition. Please use Chrome/Edge."
      );
      
      return;
    }else{

    const recognition = new SpeechRecognition();
    // console.log(recognition)
 
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = "en-US"
   recognitionRef.current = recognition;
       setSupported(true);
      setSupportWarning(
        ""
      );
    }

    return () => {
  if (recognitionRef.current) recognitionRef.current.stop();
};
},[])





  ///////Online-Offline Error

 useEffect(() => {
  const handleOnline = () => {
    // console.log("🌐 Back online!");
    setSupportWarning("✅ Network restored. Restarting...");

  };

  const handleOffline = () => {
    // console.log("🚫 Offline");
    setSupportWarning("⚠️ You are offline. Speech recognition paused.");

  };

  window.addEventListener("online", handleOnline);
  window.addEventListener("offline", handleOffline);

  return () => {
    window.removeEventListener("online", handleOnline);
    window.removeEventListener("offline", handleOffline);
  };
}, []);



///onerror
useEffect(()=>{

  if(!recognitionRef.current) return;
recognitionRef.current.onerror = (event) => {
        if(event.error === "not-allowed" || event.error === "service-not-allowed") {
           setSupported(false);
           setSupportWarning(
       "⚠️ Microphone access denied. Please allow microphone permission."
      );
    setListening(false);
  } else if(event.error === "network") {
          //  setSupported(false);
           setSupportWarning(
       "⚠️ Network error in Speech Recognition."
      );

  } else if(event.error === "aborted") {
    //  setSupported(false);
           setSupportWarning(
      "Recognition aborted.")

  }
    };

    return () => {
  recognitionRef.current.onerror = null;
};

},[recognitionRef.current])




  const handleStart = () => {
    setStarted(true);
    setCountdown(3); 
  };


const handleEnded = () => {
  // console.log(recognitionRef.current)
  if (!recognitionRef.current) return;
  setSupportWarning("");
  setAudioFinished(true);
  let silenceTimer;

  const resetSilenceTimer = () => {
    if (silenceTimer) clearTimeout(silenceTimer);
    silenceTimer = setTimeout(() => {
      recognitionRef.current.stop();
      setListening(false);
    }, 4000);
  };

  recognitionRef.current.onresult = (event) => {
 
// console.log("event.results before loop",event.results)
    let finalResultindex = 0;
    let text="";

if(isMobile){
  // console.log("isMobile",isMobile)
  text = event.results[event.results.length-1][0].transcript;
 
}else{
for (let i = finalResultindex; i < event.results.length; i++) {
      const result = event.results[i][0].transcript;
      const isFinal = event.results[i].isFinal;
  
      if (isFinal) {
        // console.log("isFinal event.results",event.results)
        text +=  result
      }
      finalResultindex = i + 1;
    }
}
    

textRef.current = text;
// console.log("Text",text)


      
// console.log("textRef",textRef.current)
       setFinalTranscript((prev) => {
          const copy = [...prev];
          copy[nextQuesValue] = textRef.current;
          return copy;
        });
     

    resetSilenceTimer();
  };

  
    recognitionRef.current.start();
    setListening(true);
    resetSilenceTimer();
    setSupportWarning("");
 
  
};


  
  const nextHandle = () => {
      setSupportWarning("");
  //  console.log( textRef.current)
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


  if (recognitionRef.current) {
    recognitionRef.current.abort();
  }

  handleEnded();
};

const repeatAudio = () => {
        setSupportWarning("");
  if (!audioRef.current) return;


  if (recognitionRef.current) {
    recognitionRef.current.abort();
    setListening(false);
  }



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
  const quesData = questionData;

  const storedName = sessionStorage.getItem("result") || "[]";
  let resultArray = JSON.parse(storedName);

  const doc = new jsPDF();
  doc.setFont("helvetica", "normal");

  let y = 15;
  const pageHeight = doc.internal.pageSize.height;

  quesData.forEach((item, i) => {

    doc.setTextColor(0, 0, 0);
    let questionText = `${i + 1}. Qus: ${item}`;
    let splitQues = doc.splitTextToSize(questionText, 180);
    let quesHeight = splitQues.length * 7; 

    if (y + quesHeight > pageHeight - 20) {
      doc.addPage();
      y = 20;
    }

    doc.text(splitQues, 10, y);
    y += quesHeight + 5; 


    doc.setTextColor(0, 0, 200);
    let answerText = `Ans: ${resultArray[i] || ""}`;
    let splitAns = doc.splitTextToSize(answerText, 180);
    let ansHeight = splitAns.length * 7; 

    if (y + ansHeight > pageHeight - 20) {
      doc.addPage();
      y = 20;
    }

    doc.text(splitAns, 10, y);
    y += ansHeight;


    y += 15; 
  });

  doc.save("AiInterviewResult.pdf");
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
        <div className="developerName"><span>Developed by -</span> <span className="nameText">Rajat Jaiswal</span></div>
        </div>
      ) : (
        <div> {!initialCountdownDone && countdown > 0 ? 
        ( <div className="Interview-countDown-text"><div className="text-message-info"><span className="wave-container">Ai Interview will start in <strong>{countdown}</strong> seconds <span className="wave-text">
        <span>.</span><span>.</span><span>.</span>
    </span>
</span>
</div></div> )
         : 
         !submitForm ?(<div>
          <div className="voise-animation-wraper">
        
            {aiReadingText()}
             {errorPopuo()}
            </div>
          <div className="totle-questions-no"><span>{nextQuesValue+1}</span>/<span>{audioData.length}</span></div>
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

