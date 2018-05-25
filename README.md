# IFCAT
Immediate-Feedback Collaborative Assessment Tool is a collaborative quiz application for the classroom, based on [immediate feedback assessment technique](https://link.springer.com/article/10.1007/BF03395423).

## Transpiling front-end components
After changes in JSX files, the code needs to be transpiled. This is specifically for React-based front-end components in:
1. ```views/student/quiz``` - the student side quiz is implemented in React
2. ```views/admin/pages/previewQuestion``` - quiz components re-used for admin-side previewing


Transpile front-end components by running ```webpack``` at the respective path (on node >=6.11.0).
