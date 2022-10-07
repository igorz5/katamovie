import React from "react";

import "./Search.scss";

interface SearchProps {
  className?: string;
  placeholder?: string;
  onChange?: (value: string) => void;
}

interface SearchState {
  value: string;
}

export default class Search extends React.PureComponent<
  SearchProps,
  SearchState
> {
  static defaultProps: SearchProps = {
    className: "",
    placeholder: "",
    onChange: () => {},
  };

  constructor(props: SearchProps) {
    super(props);

    this.state = {
      value: "",
    };
  }

  onChangeHandler = (e: React.ChangeEvent<HTMLInputElement>): void => {
    this.setState({ value: e.target.value });

    const { onChange } = this.props;
    onChange?.(e.target.value);
  };

  render(): React.ReactNode {
    const { value } = this.state;
    const { className, placeholder } = this.props;
    return (
      <div className={`search ${className}`}>
        <input
          className="search__input"
          placeholder={placeholder}
          value={value}
          onChange={this.onChangeHandler}
        />
      </div>
    );
  }
}
