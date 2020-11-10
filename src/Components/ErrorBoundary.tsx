import React, {ErrorInfo} from "react";

interface Props {
    errorMessageText: string,
    children: any
}


export class ErrorBoundary extends React.Component<Props>  {
    state = { error: null, errorInfo: null };

    componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        this.setState({
            error: error,
            errorInfo: errorInfo
        });
    }

    render() {
        if (this.state.errorInfo) {
            return (
                <>
                    <div className="panel panel--error panel--simple u-mt-m">
                        <div className="panel__body">
                            <p>
                                {this.props.errorMessageText}
                            </p>
                        </div>
                    </div>
                </>
            );
        }

        return this.props.children;
    }
}