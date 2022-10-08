import React from "react";

import { IGenre } from "../../types/IGenre";

type GenresContextType = IGenre[];

const GenresContext = React.createContext<GenresContextType>([]);

export default GenresContext;
