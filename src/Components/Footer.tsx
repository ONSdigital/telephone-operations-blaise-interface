import React from "react";

interface Props {
    external_client_url: string
}


function Footer(props: Props) {
    return (
        <>
            <footer className="footer">
                <div className="footer--body" data-analytics="footer">
                    <div className="container ">
                        <div className="grid">
                            <div className="u-mb-m">
                                <dl className="metadata metadata__list grid grid--gutterless u-cf u-mb-l"
                                    title="Blaise Server Manager link to telephone server park"
                                    aria-label="Blaise Server Manager link to telephone server park">
                                    <dt className="metadata__term grid__col col-6@m"> Telephone
                                        server park for Blaise Server Manager:
                                    </dt>
                                    <dd className="metadata__value grid__col col-6@m">{props.external_client_url}</dd>
                                </dl>
                                <hr className="footer__hr"/>
                            </div>
                        </div>
                        <div className="grid grid--flex grid--between">
                            <div className="grid__col">
                                <div className="u-mt-m u-mb-s">
                                    <img src="https://ons-design-system.netlify.app/img/ons-logo-black-en.svg"
                                         alt="Office for National Statistics"/>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </footer>
        </>
    );
}

export default Footer;