type Context = {
    deleteProject: (id: string) => Promise<Error | Project>;
};

type User = {
    id: string;
    email: string;
    password: string;
    projects: Array<string>;
};

type QueryByID = {
    id: string;
};

type CreateUserArgs = {
    user: { email: string; password: string; projects: Array<string> };
};

type UpdateUserArgs = {
    user: {
        id: number;
        email: string;
        password: string;
    };
};

type Project = {
    _id?: string;
    id: string;
    userID: string;
    name: string;
    queries: Array<string>;
};

type CreateProjectArgs = {
    project: {
        name: string;
        userID: string;
    };
};

type UpdateProjectArgs = {
    project: {
        id: string;
        name: string;
        userID: string;
    };
};

type ProjectQuery = {
    _id?: string;
    id: string;
    projectID: string;
    name: string;
    depth: number;
    complexity: number;
    timestamp: number;
    tokens: number;
};

type CreateProjectQueryArgs = {
    projectQuery: {
        projectID: string;
        number: string;
        depth: number;
        complexity: number;
        timestamp: number;
        tokens: number;
    };
};

type UpdateProjectQueryArgs = {
    projectQuery: {
        id: string;
        number: string;
        depth: number;
        complexity: number;
        timestamp: number;
        tokens: number;
    };
};