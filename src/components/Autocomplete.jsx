import React, {Component, Fragment} from "react";
import PropTypes from "prop-types";

import axios from 'axios'
import {setupCache, setup} from 'axios-cache-adapter'

const cache = setupCache({
    maxAge: 15 * 60 * 1000
});

const api = axios.create({
    adapter: cache.adapter
});

async function getSuggestions(lang, query) {
    if (query.length < 3) {
        return {};
    }
    return await api({
        url: `http://localhost:8083/v2/smartfill?language=${lang}&query=${query}`,
        method: 'get',
        headers: {"Client-ID": "foobarbaz"}
    })
        .then(async (response) => {
            console.log('Request response:', response);
            const length = await cache.store.length();
            console.log('Cache store length:', length);
            return Promise.resolve(response.data);
        });
};

class Autocomplete extends Component {
    static propTypes = {
        suggestions: PropTypes.instanceOf(Array)
    };

    static defaultProps = {
        suggestions: []
    };

    constructor(props) {
        super(props);

        this.state = {
            activeSuggestion: 0,
            filteredSuggestions: [],
            showSuggestions: false,
            userInput: ""
        };
    }

    get(e, userInput) {
        if (userInput.length >= 3) {
            api({
                url: `http://localhost:8083/v2/smartfill?language=en-US&query=${userInput}`,
                method: 'get',
                headers: {"Client-ID": "foobarbaz"}
            })
                .then(async (response) => {
                    console.log('Request response:', response);
                    const length = await cache.store.length();
                    console.log('Cache store length:', length);
                    console.log("ss", response.data);

                    let filteredSuggestions = [];
                    response.data.suggestions.map(s => filteredSuggestions.push(s));

                    let {suggestions} = this.props;
                    suggestions = {filteredSuggestions};

                    const activeSuggestion = 1;
                    this.setState({
                        filteredSuggestions,
                        showSuggestions: true,
                    });
                });
        }
    }

    onChange = e => {
        let {suggestions} = this.props;
        const userInput = e.currentTarget.value;

        this.get(e, userInput);
        const filteredSuggestions = suggestions.filter(
            suggestion =>
                suggestion.toLowerCase().indexOf(userInput.toLowerCase()) > -1
        );

        this.setState({
            activeSuggestion: 0,
            filteredSuggestions,
            showSuggestions: true,
            userInput: e.currentTarget.value
        });
    };

    onClick = e => {
        const userInput = e.currentTarget.value;
        this.get(e, userInput);
    };

    onKeyDown = e => {

        const userInput = e.currentTarget.value;
        this.get(e, userInput);
    };

    render() {
        const {
            onChange,
            onClick,
            onKeyDown,
            state: {
                activeSuggestion,
                filteredSuggestions,
                showSuggestions,
                userInput
            }
        } = this;

        let suggestionsListComponent;

        if (showSuggestions && userInput) {
            if (filteredSuggestions.length) {
                suggestionsListComponent = (
                    <ul class="suggestions">
                        {filteredSuggestions.map((suggestion, index) => {
                            let className;

                            // Flag the active suggestion with a class
                            if (index === activeSuggestion) {
                                className = "suggestion-active";
                            }

                            return (
                                <li className={className} key={suggestion} onClick={onClick}>
                                    {suggestion["full_name"]}<span className={"type"}> ({suggestion.type})</span>
                                </li>
                            );
                        })}
                    </ul>
                );
            } else {
                suggestionsListComponent = (
                    <div class="no-suggestions">
                        <em>No suggestions, you're on your own!</em>
                    </div>
                );
            }
        }

        return (
            <Fragment>
                <input
                    type="text"
                    onChange={onChange}
                    onKeyDown={onKeyDown}
                    value={userInput}
                />
                {suggestionsListComponent}
            </Fragment>
        );
    }
}

export default Autocomplete;
