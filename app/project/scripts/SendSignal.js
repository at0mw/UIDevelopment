/*
*   Including this script so I can have better access and control of signals send for logging
*/
const sendSignal = (() => {
    function sendActionPulse(joinId){        
        console.log("Update CrComLib :::: Sending Action Update :: JoinId: ", joinId);
        CrComLib.publishEvent('b', joinId, true );
        CrComLib.publishEvent('b', joinId, false );
    }

    function sendAnalogSignal(joinId, analogValue) {
        console.log("Update CrComLib :::: Sending Analog Update :: JoinId: ", joinId," Value: ", analogValue);
        CrComLib.publishEvent('n', joinId, analogValue );
    }

    function sendDigitalSignal(joinId, digitalState) {
        console.log("Update CrComLib :::: Sending Digital Update :: JoinId: ", joinId," State: ", digitalState);
        CrComLib.publishEvent('b', joinId, digitalState );
    }

    function sendStringSignal(joinId, stringValue) {
        console.log("Update CrComLib :::: Sending String Update :: JoinId: ", joinId," Value: ", stringValue);
        CrComLib.publishEvent('s', joinId, stringValue );
    }

    return {
        sendActionPulse,
        sendAnalogSignal,
        sendDigitalSignal,
        sendStringSignal
    }
})();