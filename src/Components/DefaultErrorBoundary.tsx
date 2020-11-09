import React, {ErrorInfo} from "react";

interface Props {
    children: any
}

interface State {
    error: any
    errorInfo: any
}
export class DefaultErrorBoundary extends React.Component <Props,State>  {
    state = { error: null, errorInfo: null };

    componentDidCatch(error: Error, errorInfo: ErrorInfo): any {
        this.setState({
            error: error,
            errorInfo: errorInfo
        });
    }

    render() {
        if (this.state.errorInfo) {
            return (
                <>
                    <h1>Sorry, there is a problem with the service</h1>
                    <p>Try again later.</p>
                    <p>If you have started a survey, your answers have been saved.</p>
                    <p><a href="https://ons.service-now.com/">Contact us</a> if you need to speak to someone about your survey.</p>
                    {/*<details style={{ whiteSpace: "pre-wrap" }}>*/}
                    {/*    {this.state.error && this.state.error.toString()}*/}
                    {/*    <br />*/}
                    {/*    {this.state.errorInfo.componentStack}*/}
                    {/*</details>*/}
                </>
            );
        }

        return this.props.children;
    }
}