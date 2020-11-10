import React from "react";
import Enzyme, {render, shallow} from "enzyme";

import Adapter from "enzyme-adapter-react-16";
import Footer from "./Footer";

describe("Footer Test", () => {
    Enzyme.configure({adapter: new Adapter()});

    const Props = {
        external_client_url: "localhost"
    };

    it("matches Snapshot", () => {
        const wrapper = render(<Footer external_client_url={Props.external_client_url}/>);
        expect(wrapper).toMatchSnapshot();
    });

    it("should render correctly", () => {
        const wrapper = shallow(<Footer external_client_url={Props.external_client_url}/>);
        expect(wrapper.exists()).toEqual(true);
    });

    it("should render with the external_client_url displayed", () => {
        const wrapper = shallow(<Footer external_client_url={Props.external_client_url}/>);
        expect(wrapper.html()).toContain(Props.external_client_url);
    });
});
