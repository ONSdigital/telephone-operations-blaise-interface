import React from "react";

function ONSErrorPanel() {
    return (
        <>
            <div className="panel panel--error panel--simple">
                <div className="panel__body">
                    <p>
                        Blaise Survey Manager is unable to verify or display current active survey instruments.
                        You may try resolving this by <strong>reloading</strong> this page to refresh table content.
                    </p>
                    <br/>
                    <p>
                        If this does not help and you are still experiencing problems <a
                        href="https://ons.service-now.com/">report this issue</a> to Service Desk.
                    </p>
                </div>
            </div>
        </>
    );
}

export default ONSErrorPanel;
