import React, { useState, useEffect } from 'react';
import { useLazyQuery, gql, useMutation } from '@apollo/client';
import ToolBar from './ToolBar';
import ProjectView from './ProjectView';
import { useAuth } from '../auth/AuthProvider';

const GET_PROJECT_DATA = gql`
    query getUserData($userId: String!) {
        user(id: $userId) {
            projects {
                name
                id
                userID
                apiKey
            }
        }
    }
`;

const UPDATE_RATE_LIMITER_CONFIG_MUTATION = gql`
    mutation udpateRateLimiter($projectId: String!, $rateLimiterConfig: RateLimiterConfigInput) {
        updateProject(id: $projectId, rateLimiterConfig: $rateLimiterConfig) {
            rateLimiterConfig {
                type
                options {
                    ... on WindowOptions {
                        capacity
                        windowSize
                    }
                    ... on BucketOptions {
                        capacity
                        refillRate
                    }
                }
            }
        }
    }
`;

const GET_RATE_LIMITER_CONFIG_QUERY = gql`
    query getRateLimiter($projectId: String!) {
        project(id: $projectId) {
            rateLimiterConfig {
                type
                options {
                    ... on WindowOptions {
                        capacity
                        windowSize
                    }
                    ... on BucketOptions {
                        capacity
                        refillRate
                    }
                }
            }
        }
    }
`;

interface ProjectResult {
    project: Project;
}
interface ProjectVars {
    projectId: string;
}

interface UpdateRateLimiterVars extends ProjectVars {
    rateLimiterConfig: RateLimiterConfig;
}

export default function Dashboard() {
    /** Bring the user context into this component */
    const { user } = useAuth();

    const [selectedProject, setSelectedProject] = useState<Project>();

    // Apollo graphql hooks
    /** Send query to get project information for this user */
    const [getUserData, userData] = useLazyQuery<{ user: User }, { userId: string }>(
        GET_PROJECT_DATA
    );

    const [getRateLimiterConfig, rateLimitResponse] = useLazyQuery<ProjectResult, ProjectVars>(
        GET_RATE_LIMITER_CONFIG_QUERY,
        { fetchPolicy: 'network-only' }
    );

    const [udpateRateLimiter] = useMutation<ProjectResult, UpdateRateLimiterVars>(
        UPDATE_RATE_LIMITER_CONFIG_MUTATION
    );

    // User data whenever the user changes
    useEffect(() => {
        if (user?.id) {
            getUserData({
                variables: {
                    userId: user.id,
                },
            });
        }
    }, [user]);

    // RateLimiter Settings whenever the proejct changes
    useEffect(() => {
        // Fetches Rate Limiter settings whenever project is changed
        if (selectedProject?.id) {
            (async () => {
                // FIXME: We can conditionally render an error component and remove the IIFE
                const { error } = await getRateLimiterConfig({
                    variables: {
                        projectId: selectedProject.id,
                    },
                });
                if (error) {
                    console.error(error);
                }
            })();
        }
    }, [selectedProject]);

    const handleRateLimiterConfigChange = (
        updatedConfig: RateLimiterConfig,
        saveConfig: boolean
    ) => {
        if (selectedProject) {
            if (saveConfig) {
                // Save config in database
                udpateRateLimiter({
                    variables: {
                        projectId: selectedProject.id,
                        rateLimiterConfig: updatedConfig,
                    },
                    // Refetch rate limiter data. The rate limiter query bypasses the cache so we can't just update the cache here.
                    refetchQueries: [
                        {
                            query: GET_RATE_LIMITER_CONFIG_QUERY,
                            variables: { projectId: selectedProject.id },
                        },
                    ],
                });
            } else {
                // const updatedQueries: ProjectQuery[] = fetch(
                //     `/api/projects/rateLimit/${selectedProject.id}`,
                //     {
                //         method: 'POST',
                //         body: JSON.stringify({
                //             config: updatedConfig,
                //         }),
                //     }
                // ).then((res) => res.json());
                // // update quey data in the view
            }
        }
    };

    return (
        <main className="toolBarWrapper">
            <ToolBar
                projects={userData?.data?.user.projects}
                setSelectedProject={setSelectedProject}
                projectLoading={userData ? userData.loading : false}
                rateLimiterConfig={rateLimitResponse?.data?.project.rateLimiterConfig}
                rateLimiterLoading={rateLimitResponse ? rateLimitResponse.loading : false}
                setRateLimiterConfig={handleRateLimiterConfigChange}
            />
            <ProjectView
                selectedProject={selectedProject}
                projectLoading={userData ? userData.loading : false}
                rateLimiterConfig={rateLimitResponse?.data?.project.rateLimiterConfig}
            />
        </main>
    );
}
