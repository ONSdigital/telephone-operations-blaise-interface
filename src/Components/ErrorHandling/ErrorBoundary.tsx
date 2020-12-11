import React, {ErrorInfo, ReactNode} from "react";

interface Props {
    errorMessageText: string,
    children: ReactNode
}

interface State {
    error?: Error
    errorInfo: ErrorInfo
}


export class ErrorBoundary extends React.Component<Props,State>  {
    state = { errorInfo: {componentStack: "Fine"} };

    componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
        this.setState({
            error: error,
            errorInfo: errorInfo
        });
    }

    render(): ReactNode {
        if (this.state.errorInfo.componentStack !== "Fine") {
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