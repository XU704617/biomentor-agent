from app.schemas.user import UserCreate, UserUpdate, UserResponse, UserListResponse
from app.schemas.course import CourseCreate, CourseUpdate, CourseResponse, CourseListResponse
from app.schemas.question import (
    QuestionCreate,
    QuestionUpdate,
    QuestionResponse,
    QuestionListResponse,
    QuestionGenerateRequest,
)
from app.schemas.quiz import QuizCreate, QuizUpdate, QuizResponse, QuizListResponse
from app.schemas.attempt import (
    AttemptCreate,
    AttemptUpdate,
    AttemptResponse,
    AttemptListResponse,
    AttemptSubmitRequest,
)
from app.schemas.student_profile import (
    StudentProfileCreate,
    StudentProfileUpdate,
    StudentProfileResponse,
    StudentProfileListResponse,
)
from app.schemas.file_resource import (
    FileResourceCreate,
    FileResourceUpdate,
    FileResourceResponse,
    FileResourceListResponse,
)
